import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Utility: normalize strings/arrays/objects for stable cache keys (treat "similar" as identical)
function normalizeForKey(input) {
  if (input == null) return null;
  if (typeof input === 'string') return input.trim().toLowerCase().replace(/\s+/g, ' ');
  if (Array.isArray(input)) return input.map(normalizeForKey).sort();
  if (typeof input === 'object') {
    const entries = Object.entries(input).map(([k, v]) => [k, normalizeForKey(v)]);
    entries.sort(([a], [b]) => (a > b ? 1 : a < b ? -1 : 0));
    return Object.fromEntries(entries);
  }
  return input;
}

async function invokeCachedLLM(base44, args) {
  const { data } = await base44.functions.invoke('invokeLlmWithCache', args);
  // data: { cached, key, data }
  return data?.data ?? null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const {
      listingId,
      title = '',
      description = '',
      category = '',
      condition = 'used',
      price = 0,
      images = [],
      features = '',
      keywords = '',
      include = [
        'titles',
        'description',
        'pricing',
        'recommendations',
        'imageAnalysis',
        'moderation'
      ]
    } = body || {};

    const includes = new Set(include && include.length ? include : []);

    // Fetch listing if listingId provided (for moderation or fallbacks)
    let listing = null;
    if (listingId) {
      const found = await base44.asServiceRole.entities.Listing.filter({ id: listingId });
      listing = found?.[0] || null;
    }

    const eff = {
      title: title || listing?.title || '',
      description: description || listing?.description || '',
      category: category || listing?.category || '',
      condition: condition || listing?.condition || 'used',
      price: typeof price === 'number' && !isNaN(price) ? price : (listing?.price || 0),
      images: (images && images.length ? images : (listing?.images || [])).slice(0, 6),
      features: features || '',
      keywords: keywords || ''
    };

    // Precompute market stats (non-LLM) if needed by pricing/description position
    let marketStats = null;
    if (includes.has('pricing') || includes.has('description')) {
      const allListings = await base44.asServiceRole.entities.Listing.list();
      const categoryListings = (allListings || []).filter(
        (l) => l.category === eff.category && l.status === 'active' && (l.price || 0) > 0
      );
      const prices = categoryListings.map((l) => l.price).sort((a, b) => a - b);
      const avgPrice = prices.length > 0 ? prices.reduce((s, p) => s + p, 0) / prices.length : 0;
      const medianPrice = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0;
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      marketStats = { categoryListings, prices, avgPrice, medianPrice, minPrice, maxPrice };
    }

    // Image Analysis (quality + issues) — shared by pricing/description and explicit imageAnalysis
    let imageAnalysis = null;
    let imageQualityScore = 50;
    let imageTipsText = '';
    if (includes.has('imageAnalysis') || includes.has('pricing') || includes.has('description') || includes.has('moderation')) {
      const toAnalyze = eff.images.slice(0, 3);
      const perImage = await Promise.all(
        toAnalyze.map(async (url, index) => {
          const analysis = await invokeCachedLLM(base44, {
            prompt: `Analysiere dieses Produktbild für einen Online-Marktplatz.\n\nBewerte folgende Aspekte und antworte strikt im JSON-Format:\n1. Bildqualität (Schärfe, Auflösung)\n2. Beleuchtung (zu hell, zu dunkel, optimal)\n3. Komposition und Bildausschnitt\n4. Hintergrund (ablenkend, professionell)\n5. Produktpräsentation\n6. Liste konkreter Verbesserungsvorschläge` ,
            file_urls: [url],
            response_json_schema: {
              type: 'object',
              properties: {
                quality: { type: 'number' },
                brightness: { type: 'string', enum: ['too_dark', 'too_bright', 'good'] },
                sharpness: { type: 'string', enum: ['blurry', 'acceptable', 'good'] },
                composition: { type: 'string', enum: ['poor', 'acceptable', 'good'] },
                issues: { type: 'array', items: { type: 'string' } },
                suggestions: { type: 'array', items: { type: 'string' } }
              }
            },
            ttl_seconds: 600,
            cache_key_extra: normalizeForKey({ kind: 'img-analysis', url })
          }).catch(() => null);
          return {
            index,
            quality: Math.max(1, Math.min(100, Math.round(analysis?.quality ?? 50))),
            brightness: analysis?.brightness || 'good',
            sharpness: analysis?.sharpness || 'acceptable',
            composition: analysis?.composition || 'acceptable',
            issues: Array.isArray(analysis?.issues) ? analysis.issues : [],
            suggestions: Array.isArray(analysis?.suggestions) ? analysis.suggestions : []
          };
        })
      );

      imageAnalysis = perImage;
      const avgQuality = perImage.length > 0 ? perImage.reduce((s, x) => s + (x.quality || 0), 0) / perImage.length : 50;
      imageQualityScore = Math.round(avgQuality);

      // Aggregate issues/suggestions -> tips
      const uniqueIssues = [...new Set((perImage || []).flatMap((x) => x.issues || []))];
      const tipRes = await invokeCachedLLM(base44, {
        prompt: `Basierend auf dieser Bildanalyse, gib 2-3 konkrete, praktische Tipps für bessere Produktfotos (1-2 Sätze).\n\nDurchschnittliche Qualität: ${imageQualityScore}/100\nAnzahl Bilder: ${eff.images.length}\nHauptprobleme: ${uniqueIssues.slice(0, 3).join(', ')}`,
        response_json_schema: {
          type: 'object',
          properties: { tips: { type: 'string' } }
        },
        ttl_seconds: 600,
        cache_key_extra: normalizeForKey({ kind: 'img-tips', issues: uniqueIssues, n: eff.images.length, q: imageQualityScore })
      }).catch(() => null);
      imageTipsText = tipRes?.tips || '';
    }

    // Image content insights (short description) used by description generation
    let imageInsights = '';
    if ((includes.has('description') || includes.has('moderation')) && eff.images.length > 0) {
      const imgDesc = await invokeCachedLLM(base44, {
        prompt: `Analizza queste immagini di prodotto e descrivi in modo conciso cosa si vede (max 1-2 frasi).`,
        file_urls: eff.images.slice(0, 2),
        response_json_schema: { type: 'object', properties: { description: { type: 'string' } } },
        ttl_seconds: 600,
        cache_key_extra: normalizeForKey({ kind: 'img-content', urls: eff.images.slice(0, 2) })
      }).catch(() => null);
      imageInsights = imgDesc?.description || '';
    }

    // Titles generation
    let titlesBundle = null;
    if (includes.has('titles')) {
      // Fetch successful titles for inspiration (sold in same category)
      const similarSold = await base44.asServiceRole.entities.Listing.filter({ category: eff.category, status: 'sold' }, '-created_date', 10).catch(() => []);
      const successfulTitles = (similarSold || []).map((l) => l.title).filter(Boolean).slice(0, 5);

      const titlesRes = await invokeCachedLLM(base44, {
        prompt: `Generiere 5 ansprechende, SEO-optimierte Produkttitel für einen Online-Marktplatz.\n\nProduktdetails:\n- Kategorie: ${eff.category}\n${eff.description ? `- Beschreibung: ${eff.description.substring(0, 200)}` : ''}\n${eff.price ? `- Preis: ${eff.price}€` : ''}\n${eff.keywords ? `- Schlagwörter: ${eff.keywords}` : ''}\n\n${successfulTitles.length > 0 ? `Erfolgreiche Beispiele aus der Kategorie:\n${successfulTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}` : ''}\n\nAnforderungen:\n- 40-70 Zeichen optimal\n- Wichtigste Infos vorne\n- Suchmaschinenfreundlich\n- Ansprechend und verkaufsfördernd\n- Keine Übertreibungen\n- Keine Emojis\n\nGeneriere 5 verschiedene Titel mit unterschiedlichen Ansätzen (z.B. informativ, emotional, feature-fokussiert).`,
        response_json_schema: {
          type: 'object',
          properties: {
            titles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  style: { type: 'string' },
                  reason: { type: 'string' }
                }
              },
              minItems: 5,
              maxItems: 5
            }
          }
        },
        ttl_seconds: 600,
        cache_key_extra: normalizeForKey({ kind: 'titles', cat: eff.category, d: eff.description?.slice(0, 200), p: eff.price, kw: eff.keywords })
      });

      const keywordList = eff.keywords ? eff.keywords.toLowerCase().split(/[\,\s]+/).filter(Boolean) : [];
      const titlesWithMetrics = (titlesRes?.titles || []).map((titleObj) => {
        const length = (titleObj?.title || '').length;
        let seoScore = 50;
        if (length >= 40 && length <= 70) seoScore += 20; else if (length >= 30 && length <= 80) seoScore += 10;
        if (keywordList.length) {
          const lower = (titleObj?.title || '').toLowerCase();
          const matches = keywordList.filter((kw) => lower.includes(kw)).length;
          seoScore += Math.min(matches * 10, 30);
        }
        if ((titleObj?.title || '').toLowerCase().includes((eff.category || '').toLowerCase())) seoScore += 10;
        return { ...titleObj, length, seoScore: Math.min(100, seoScore) };
      }).sort((a, b) => b.seoScore - a.seoScore);

      titlesBundle = { success: true, titles: titlesWithMetrics, count: titlesWithMetrics.length };
    }

    // Description generation
    let descriptionBundle = null;
    if (includes.has('description')) {
      const avgPrice = marketStats?.avgPrice || eff.price || 0;
      const pricePosition = eff.price < avgPrice * 0.8 ? 'ottimo affare' : eff.price > avgPrice * 1.2 ? 'premium' : 'competitivo';

      const prompt = `Sei un copywriter esperto di e-commerce. Crea una descrizione di prodotto PERSUASIVA e DETTAGLIATA.\n\nPRODOTTO:\nTitolo: ${eff.title}\nCategoria: ${eff.category}\nCondizione: ${eff.condition}\nPrezzo: ${eff.price}€ (${pricePosition} - media categoria: ${avgPrice.toFixed(2)}€)\n${eff.features ? `Caratteristiche specifiche: ${eff.features}` : ''}\n${imageInsights ? `Dalle immagini: ${imageInsights}` : ''}\n\nOBIETTIVO:\n1. Catturi l'attenzione nei primi 2 secondi\n2. Evidenzi i benefici chiave\n3. Crei urgenza e desiderio\n4. Anticipi e risolva obiezioni comuni\n5. Includa call-to-action efficace\n\nSTRUTTURA:\n- Hook iniziale accattivante (1 frase)\n- Descrizione dettagliata con benefici\n- Specifiche tecniche (se pertinenti)\n- Condizioni e dettagli d'uso\n- Invito all'azione\n\nTONO:\n- Professionale ma amichevole\n- Onesto e trasparente\n- Entusiasta ma credibile\n- Ottimizzato per conversione\n\nLUNGHEZZA: 150-250 parole\n\nScrivi SOLO la descrizione, senza titoli o formattazione speciale.`;

      const ai = await invokeCachedLLM(base44, {
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            highlights: { type: 'array', items: { type: 'string' } },
            keywords: { type: 'array', items: { type: 'string' } },
            callToAction: { type: 'string' }
          }
        },
        ttl_seconds: 600,
        cache_key_extra: normalizeForKey({ kind: 'desc', t: eff.title, c: eff.category, cond: eff.condition, p: eff.price, f: eff.features, img: !!imageInsights })
      });

      descriptionBundle = {
        success: true,
        description: ai?.description || '',
        highlights: ai?.highlights || [],
        keywords: ai?.keywords || [],
        callToAction: ai?.callToAction || '',
        imageInsights: imageInsights || null,
        marketPosition: pricePosition
      };
    }

    // Pricing suggestion
    let pricingBundle = null;
    if (includes.has('pricing')) {
      // Extra stats for pricing (conversion etc.)
      const recentOrders = await base44.asServiceRole.entities.Order?.filter?.({ status: 'delivered' }, '-created_date', 100).catch(() => []) || [];
      const orderItems = await base44.asServiceRole.entities.OrderItem?.list?.().catch(() => []) || [];
      const categorySales = orderItems.filter((item) => recentOrders.some((o) => o.id === item.orderId)).length;
      const activeCount = marketStats?.categoryListings?.length || 0;
      const prices = marketStats?.prices || [];
      const avgPrice = marketStats?.avgPrice || 0;
      const medianPrice = marketStats?.medianPrice || 0;
      const minPrice = marketStats?.minPrice || 0;
      const maxPrice = marketStats?.maxPrice || 0;
      const conversionRate = activeCount > 0 ? (categorySales / activeCount) * 100 : 0;

      const ai = await invokeCachedLLM(base44, {
        prompt: `Sei un esperto di pricing per marketplace e-commerce. Suggerisci un prezzo ottimale.\n\nPRODOTTO:\nTitolo: ${eff.title}\nDescrizione: ${eff.description || 'Non fornita'}\nCategoria: ${eff.category}\nCondizione: ${eff.condition}\nQualità immagini: ${imageQualityScore}/10\nNumero immagini: ${eff.images.length}\n\nANALISI DI MERCATO:\n- Annunci attivi categoria: ${activeCount}\n- Prezzo medio: ${avgPrice.toFixed(2)}€\n- Prezzo mediano: ${medianPrice.toFixed(2)}€\n- Range prezzi: ${minPrice.toFixed(2)}€ - ${maxPrice.toFixed(2)}€\n- Tasso conversione: ${conversionRate.toFixed(1)}%\n- Vendite recenti: ${categorySales}\n\nOBIETTIVO:\nSuggerisci 3 prezzi strategici: competitivo, ottimale, premium. Fornisci anche una spiegazione dettagliata e trend/demand.`,
        response_json_schema: {
          type: 'object',
          properties: {
            competitive: { type: 'number' },
            optimal: { type: 'number' },
            premium: { type: 'number' },
            reasoning: { type: 'string' },
            marketTrend: { type: 'string', enum: ['growing', 'stable', 'declining'] },
            demandLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        },
        ttl_seconds: 600,
        cache_key_extra: normalizeForKey({ kind: 'pricing', t: eff.title, c: eff.category, cond: eff.condition, imgs: eff.images.length, q: imageQualityScore, stats: { activeCount, avgPrice, medianPrice, minPrice, maxPrice, conversionRate, categorySales } })
      });

      pricingBundle = {
        success: true,
        prices: {
          competitive: Math.round((ai?.competitive || 0) * 100) / 100,
          optimal: Math.round((ai?.optimal || 0) * 100) / 100,
          premium: Math.round((ai?.premium || 0) * 100) / 100
        },
        reasoning: ai?.reasoning || '',
        marketAnalysis: {
          avgPrice: Math.round((avgPrice) * 100) / 100,
          medianPrice: Math.round((medianPrice) * 100) / 100,
          priceRange: { min: minPrice, max: maxPrice },
          activeListings: activeCount,
          recentSales: categorySales,
          conversionRate: Math.round(conversionRate * 10) / 10,
          trend: ai?.marketTrend || 'stable',
          demand: ai?.demandLevel || 'medium'
        },
        recommendations: ai?.recommendations || [],
        imageQualityScore
      };
    }

    // Recommendations (personalized)
    let recommendationsBundle = null;
    if (includes.has('recommendations')) {
      const activities = await base44.asServiceRole.entities.UserActivity.filter({ userId: user.email }, '-created_date', 100).catch(() => []);
      const favorites = await base44.asServiceRole.entities.Favorite.filter({ user_email: user.email }).catch(() => []);
      const allActiveListings = await base44.asServiceRole.entities.Listing.filter({ status: 'active', moderationStatus: 'approved' }).catch(() => []);

      const viewedCategories = activities.filter((a) => a.activityType === 'view' && a.category).map((a) => a.category);
      const searchedTerms = activities.filter((a) => a.activityType === 'search' && a.searchTerm).map((a) => a.searchTerm);
      const favoritedListingIds = favorites.map((f) => f.listing_id);
      const viewedListingIds = activities.filter((a) => a.activityType === 'view' && a.listingId).map((a) => a.listingId);

      const favoritedCategories = favorites
        .map((fav) => allActiveListings.find((l) => l.id === fav.listing_id)?.category)
        .filter(Boolean);

      const userProfile = {
        viewedCategories: [...new Set(viewedCategories)],
        searchedTerms: [...new Set(searchedTerms)],
        favoritedCategories: [...new Set(favoritedCategories)],
        priceRange: activities.filter((a) => a.priceRange).map((a) => a.priceRange).slice(0, 5),
        cities: [...new Set(activities.filter((a) => a.city).map((a) => a.city))].slice(0, 5),
        recentActivity: activities.slice(0, 20).map((a) => ({ type: a.activityType, category: a.category, searchTerm: a.searchTerm, date: a.created_date }))
      };

      const listingsForAI = allActiveListings
        .filter((l) => !viewedListingIds.includes(l.id) && !favoritedListingIds.includes(l.id))
        .slice(0, 50)
        .map((l) => ({ id: l.id, title: l.title, category: l.category, price: l.price, city: l.city, description: l.description?.substring(0, 200) }));

      const ai = await invokeCachedLLM(base44, {
        prompt: `Du bist ein Empfehlungsalgorithmus für einen Kleinanzeigen-Marktplatz. Analysiere das Nutzerprofil und wähle die 6 besten Listings aus, die dem Nutzer am ehesten gefallen würden.\n\nNutzerprofil:\n${JSON.stringify(userProfile, null, 2)}\n\nVerfügbare Listings:\n${JSON.stringify(listingsForAI, null, 2)}\n\nBewertungskriterien:\n1. Übereinstimmung mit angesehenen/favorisierten Kategorien (40%)\n2. Relevanz zu Suchbegriffen (30%)\n3. Preisbereich und Stadt (20%)\n4. Aktualität der Interessen (10%)\n\nWICHTIG: NUR aus den bereitgestellten Listings wählen, diversifizieren, GENAU 6 IDs.\nAntwortformat: { "recommendations": [{ "listingId": "...", "score": 0.95, "reason": "..." }] }`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: { type: 'object', properties: { listingId: { type: 'string' }, score: { type: 'number' }, reason: { type: 'string' } } }
            }
          }
        },
        ttl_seconds: 300,
        cache_key_extra: normalizeForKey({ kind: 'recs', profile: userProfile, pool: listingsForAI.map((x) => x.id) })
      }).catch(() => ({ recommendations: [] }));

      const valid = (ai?.recommendations || [])
        .filter((rec) => allActiveListings.some((l) => l.id === rec.listingId))
        .slice(0, 6)
        .map((rec) => {
          const l = allActiveListings.find((x) => x.id === rec.listingId);
          return { ...l, recommendationScore: rec.score, recommendationReason: rec.reason };
        });

      // Simple fallback
      if (valid.length < 3) {
        const catScores = {};
        viewedCategories.forEach((c) => (catScores[c] = (catScores[c] || 0) + 1));
        favoritedCategories.forEach((c) => (catScores[c] = (catScores[c] || 0) + 2));
        const topCat = Object.keys(catScores).sort((a, b) => (catScores[b] || 0) - (catScores[a] || 0))[0];
        const fallback = allActiveListings
          .filter(
            (l) =>
              !valid.some((r) => r.id === l.id) &&
              !viewedListingIds.includes(l.id) &&
              !favoritedListingIds.includes(l.id) &&
              (topCat ? l.category === topCat : true)
          )
          .slice(0, 6 - valid.length)
          .map((l) => ({ ...l, recommendationScore: 0.7, recommendationReason: topCat ? `Basierend auf deinem Interesse an ${topCat}` : 'Beliebte Anzeige' }));
        valid.push(...fallback);
      }

      recommendationsBundle = {
        recommendations: valid.slice(0, 6),
        userProfile: {
          topCategories: Object.entries(
            viewedCategories.concat(favoritedCategories).reduce((acc, cat) => {
              acc[cat] = (acc[cat] || 0) + 1;
              return acc;
            }, {})
          )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([cat]) => cat),
          searchTerms: searchedTerms.slice(0, 5)
        }
      };
    }

    // Moderation pipeline (single call for text + first image)
    let moderationBundle = null;
    if (includes.has('moderation')) {
      const mod = await invokeCachedLLM(base44, {
        prompt: `Du bist ein Content-Moderationssystem für einen Kleinanzeigen-Marktplatz. Analysiere den Inhalt (Titel, Beschreibung, Kategorie) und – wenn verfügbar – die beigefügten Bilder.\n\nPrüfe auf: Illegale Inhalte, Betrug, Hassrede/Diskriminierung, sexuelle Inhalte, Gewalt, Spam/Werbung, Kontaktdaten im Text, verbotene Verkäufe.\n\nGib zurück: flagged (bool), severity (low|medium|high|critical), categories (array), reason (kurz), imageIssues (array).`,
        file_urls: eff.images.slice(0, 1),
        response_json_schema: {
          type: 'object',
          properties: {
            flagged: { type: 'boolean' },
            severity: { type: 'string' },
            categories: { type: 'array', items: { type: 'string' } },
            reason: { type: 'string' },
            imageIssues: { type: 'array', items: { type: 'string' } },
            confidence: { type: 'number' }
          }
        },
        ttl_seconds: 600,
        cache_key_extra: normalizeForKey({ kind: 'moderation', t: eff.title, d: eff.description, c: eff.category, img: eff.images.slice(0, 1) })
      }).catch(() => null);

      const textAnalysis = {
        flagged: !!mod?.flagged,
        severity: mod?.severity || 'low',
        categories: mod?.categories || [],
        reason: mod?.reason || '',
        confidence: typeof mod?.confidence === 'number' ? mod.confidence : 0.8
      };
      const imageModeration = {
        flagged: Array.isArray(mod?.imageIssues) && mod.imageIssues.length > 0 ? true : !!mod?.flagged,
        severity: mod?.severity || 'low',
        issues: mod?.imageIssues || [],
        reason: mod?.reason || ''
      };

      const isFlagged = !!(textAnalysis.flagged || imageModeration.flagged);
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
      const finalSeverity = (Object.keys(severityLevels).find((k) => severityLevels[k] === Math.max(severityLevels[textAnalysis.severity] || 0, severityLevels[imageModeration.severity] || 0)) || 'low');

      moderationBundle = {
        success: true,
        flagged: isFlagged,
        severity: finalSeverity,
        categories: [...new Set([...(textAnalysis.categories || []), ...(imageModeration.issues || [])])],
        autoRejected: finalSeverity === 'critical',
        textAnalysis,
        imageAnalysis: imageModeration
      };
    }

    // Compose image summary bundle (overall)
    let imageBundle = null;
    if (includes.has('imageAnalysis')) {
      const strengths = [];
      if (imageAnalysis && imageAnalysis.length) {
        const len = imageAnalysis.length;
        const good = (k, v) => imageAnalysis.filter((x) => x[k] === v).length >= len * 0.7;
        if (good('brightness', 'good')) strengths.push('Gute Beleuchtung in den meisten Bildern');
        if (good('sharpness', 'good')) strengths.push('Scharfe, klare Produktdarstellung');
        if (good('composition', 'good')) strengths.push('Professionelle Bildkomposition');
        if (eff.images.length >= 3) strengths.push('Ausreichend Bilder für gute Produktpräsentation');
      }
      let overallQuality = 'poor';
      if (imageQualityScore >= 80) overallQuality = 'excellent'; else if (imageQualityScore >= 65) overallQuality = 'good'; else if (imageQualityScore >= 50) overallQuality = 'fair';
      imageBundle = {
        success: true,
        qualityScore: imageQualityScore,
        overallQuality,
        imageAnalysis: imageAnalysis || [],
        strengths: strengths.slice(0, 3),
        improvements: [...new Set((imageAnalysis || []).flatMap((x) => x.suggestions || []))].slice(0, 5),
        tips: imageTipsText,
        imageCount: eff.images.length
      };
    }

    return Response.json({
      success: true,
      titles: titlesBundle,
      description: descriptionBundle,
      pricing: pricingBundle,
      recommendations: recommendationsBundle,
      image: imageBundle,
      moderation: moderationBundle
    });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});