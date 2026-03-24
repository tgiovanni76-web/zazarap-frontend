import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { images } = await req.json();

    if (!images || images.length === 0) {
      return Response.json({ 
        error: 'Mindestens ein Bild erforderlich',
        success: false 
      }, { status: 400 });
    }

    // Analysiere alle Bilder mit der KI
    const imageAnalysisPromises = images.map(async (imageUrl, index) => {
      const prompt = `Analysiere dieses Produktbild für einen Online-Marktplatz.

Bewerte folgende Aspekte:
1. Bildqualität (Schärfe, Auflösung)
2. Beleuchtung (zu hell, zu dunkel, optimal)
3. Komposition und Bildausschnitt
4. Hintergrund (ablenkend, professionell)
5. Produktpräsentation

Gib konkrete Verbesserungsvorschläge.`;

      try {
        const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          file_urls: [imageUrl],
          response_json_schema: {
            type: 'object',
            properties: {
              quality: {
                type: 'number',
                description: 'Qualitätsscore 0-100'
              },
              brightness: {
                type: 'string',
                enum: ['too_dark', 'too_bright', 'good'],
                description: 'Helligkeitsbewertung'
              },
              sharpness: {
                type: 'string',
                enum: ['blurry', 'acceptable', 'good'],
                description: 'Schärfebewertung'
              },
              composition: {
                type: 'string',
                enum: ['poor', 'acceptable', 'good'],
                description: 'Kompositionsbewertung'
              },
              issues: {
                type: 'array',
                items: { type: 'string' },
                description: 'Liste gefundener Probleme'
              },
              suggestions: {
                type: 'array',
                items: { type: 'string' },
                description: 'Konkrete Verbesserungsvorschläge'
              }
            }
          }
        });

        return {
          index,
          ...analysis
        };
      } catch (err) {
        console.error(`Error analyzing image ${index}:`, err);
        return {
          index,
          quality: 50,
          brightness: 'good',
          sharpness: 'acceptable',
          composition: 'acceptable',
          issues: ['Analyse fehlgeschlagen'],
          suggestions: []
        };
      }
    });

    const imageAnalysis = await Promise.all(imageAnalysisPromises);

    // Berechne Gesamtqualität
    const avgQuality = imageAnalysis.reduce((sum, img) => sum + img.quality, 0) / imageAnalysis.length;
    
    // Bestimme Overall Quality Level
    let overallQuality = 'poor';
    if (avgQuality >= 80) overallQuality = 'excellent';
    else if (avgQuality >= 65) overallQuality = 'good';
    else if (avgQuality >= 50) overallQuality = 'fair';

    // Sammle alle Probleme und Vorschläge
    const allIssues = imageAnalysis.flatMap(img => img.issues || []);
    const allSuggestions = imageAnalysis.flatMap(img => img.suggestions || []);

    // Entferne Duplikate
    const uniqueIssues = [...new Set(allIssues)];
    const uniqueSuggestions = [...new Set(allSuggestions)];

    // Generiere Stärken basierend auf der Analyse
    const strengths = [];
    const goodBrightness = imageAnalysis.filter(img => img.brightness === 'good').length;
    const goodSharpness = imageAnalysis.filter(img => img.sharpness === 'good').length;
    const goodComposition = imageAnalysis.filter(img => img.composition === 'good').length;

    if (goodBrightness >= imageAnalysis.length * 0.7) {
      strengths.push('Gute Beleuchtung in den meisten Bildern');
    }
    if (goodSharpness >= imageAnalysis.length * 0.7) {
      strengths.push('Scharfe, klare Produktdarstellung');
    }
    if (goodComposition >= imageAnalysis.length * 0.7) {
      strengths.push('Professionelle Bildkomposition');
    }
    if (images.length >= 3) {
      strengths.push('Ausreichend Bilder für gute Produktpräsentation');
    }

    // Generiere allgemeine Tipps
    const tips = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Basierend auf dieser Bildanalyse, gib 2-3 konkrete, praktische Tipps für bessere Produktfotos:
      
Durchschnittliche Qualität: ${avgQuality.toFixed(0)}/100
Anzahl Bilder: ${images.length}
Hauptprobleme: ${uniqueIssues.slice(0, 3).join(', ')}

Gib praktische, umsetzbare Tipps in 1-2 Sätzen.`,
      response_json_schema: {
        type: 'object',
        properties: {
          tips: {
            type: 'string',
            description: 'Praktische Tipps als zusammenhängender Text'
          }
        }
      }
    });

    return Response.json({
      success: true,
      qualityScore: Math.round(avgQuality),
      overallQuality,
      imageAnalysis,
      strengths: strengths.slice(0, 3),
      improvements: uniqueSuggestions.slice(0, 5),
      tips: tips.tips,
      imageCount: images.length
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});