import React from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Star, CheckCircle2, Eye, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const translations = {
  de: {
    pageTitle: "Werbung & Premium-Pakete",
    pageSubtitle: "Mehr Sichtbarkeit. Mehr Kunden. Mehr Verkäufe.",
    heroTitle: "Erhöhen Sie Ihre Reichweite auf Zazarap",
    sectionTitle: "Premium-Werbung für private Nutzer",
    sectionDesc: "Steigern Sie die Sichtbarkeit Ihrer Anzeigen mit unseren Premium-Optionen. Ideal für Verkäufer, die schneller verkaufen möchten.",
    buy: "Jetzt kaufen",
    topTitle: "TOP-Anzeige",
    topDesc: "Ihre Anzeige wird 7 Tage lang ganz oben in der Kategorie angezeigt.",
    highlightTitle: "Hervorgehobene Anzeige",
    highlightDesc: "Farblicher Rahmen + besserer Platz in den Suchergebnissen.",
    premium14Title: "Premium 14 Tage",
    premium14Desc: "Maximale Sichtbarkeit für zwei Wochen mit allen Vorteilen.",
    features: "Was Sie bekommen:",
    feature1: "Vorrangige Platzierung",
    feature2: "Bis zu 10x mehr Aufrufe",
    feature3: "Farbliche Hervorhebung",
    feature4: "Höhere Verkaufschancen",
    howItWorks: "So funktioniert's",
    step1: "Paket wählen",
    step1Desc: "Wählen Sie das passende Premium-Paket für Ihre Anzeige",
    step2: "Bezahlen",
    step2Desc: "Sichere Zahlung per PayPal oder Stripe",
    step3: "Sofort aktiv",
    step3Desc: "Ihre Anzeige wird sofort hervorgehoben",
    stats: "Unsere Ergebnisse",
    stat1: "10x mehr Sichtbarkeit",
    stat2: "3x schneller verkauft",
    stat3: "95% Zufriedenheit",
  },
  it: {
    pageTitle: "Pubblicità & Pacchetti Premium",
    pageSubtitle: "Più visibilità. Più clienti. Più vendite.",
    heroTitle: "Aumenta la tua visibilità su Zazarap",
    sectionTitle: "Pubblicità premium per utenti privati",
    sectionDesc: "Aumenta la visibilità dei tuoi annunci con le opzioni premium. Ideale per chi vuole vendere più velocemente.",
    buy: "Acquista ora",
    topTitle: "Annuncio TOP",
    topDesc: "Il tuo annuncio resta in cima alla categoria per 7 giorni.",
    highlightTitle: "Annuncio evidenziato",
    highlightDesc: "Cornice colorata + migliore posizione nei risultati di ricerca.",
    premium14Title: "Premium 14 giorni",
    premium14Desc: "Massima visibilità per due settimane con tutti i vantaggi.",
    features: "Cosa ottieni:",
    feature1: "Posizionamento prioritario",
    feature2: "Fino a 10x più visualizzazioni",
    feature3: "Evidenziazione colorata",
    feature4: "Maggiori probabilità di vendita",
    howItWorks: "Come funziona",
    step1: "Scegli il pacchetto",
    step1Desc: "Seleziona il pacchetto premium adatto al tuo annuncio",
    step2: "Paga",
    step2Desc: "Pagamento sicuro con PayPal o Stripe",
    step3: "Attivo subito",
    step3Desc: "Il tuo annuncio viene evidenziato immediatamente",
    stats: "I nostri risultati",
    stat1: "10x più visibilità",
    stat2: "3x vendita più veloce",
    stat3: "95% soddisfazione",
  },
  en: {
    pageTitle: "Ads & Premium Packages",
    pageSubtitle: "More visibility. More customers. More sales.",
    heroTitle: "Boost your reach on Zazarap",
    sectionTitle: "Premium ads for private users",
    sectionDesc: "Increase your ad visibility with our premium options. Ideal for sellers who want to sell faster.",
    buy: "Buy now",
    topTitle: "TOP Ad",
    topDesc: "Your ad stays at the top of the category for 7 days.",
    highlightTitle: "Highlighted Ad",
    highlightDesc: "Colored frame + better position in search results.",
    premium14Title: "Premium 14 days",
    premium14Desc: "Maximum visibility for two weeks with all benefits.",
    features: "What you get:",
    feature1: "Priority placement",
    feature2: "Up to 10x more views",
    feature3: "Color highlighting",
    feature4: "Higher sales chances",
    howItWorks: "How it works",
    step1: "Choose package",
    step1Desc: "Select the premium package that fits your ad",
    step2: "Pay",
    step2Desc: "Secure payment via PayPal or Stripe",
    step3: "Instantly active",
    step3Desc: "Your ad gets highlighted immediately",
    stats: "Our results",
    stat1: "10x more visibility",
    stat2: "3x faster sales",
    stat3: "95% satisfaction",
  },
  fr: {
    pageTitle: "Publicité & Packs Premium",
    pageSubtitle: "Plus de visibilité. Plus de clients. Plus de ventes.",
    heroTitle: "Augmentez votre portée sur Zazarap",
    sectionTitle: "Publicité premium pour particuliers",
    sectionDesc: "Augmentez la visibilité de vos annonces avec nos options premium. Idéal pour vendre plus vite.",
    buy: "Acheter",
    topTitle: "Annonce TOP",
    topDesc: "Votre annonce reste en tête de catégorie pendant 7 jours.",
    highlightTitle: "Annonce mise en avant",
    highlightDesc: "Cadre coloré + meilleure position dans les résultats.",
    premium14Title: "Premium 14 jours",
    premium14Desc: "Visibilité maximale pendant deux semaines avec tous les avantages.",
    features: "Ce que vous obtenez:",
    feature1: "Placement prioritaire",
    feature2: "Jusqu'à 10x plus de vues",
    feature3: "Mise en valeur colorée",
    feature4: "Plus de chances de vente",
    howItWorks: "Comment ça marche",
    step1: "Choisir un pack",
    step1Desc: "Sélectionnez le pack premium adapté à votre annonce",
    step2: "Payer",
    step2Desc: "Paiement sécurisé par PayPal ou Stripe",
    step3: "Actif immédiatement",
    step3Desc: "Votre annonce est mise en avant instantanément",
    stats: "Nos résultats",
    stat1: "10x plus de visibilité",
    stat2: "3x vente plus rapide",
    stat3: "95% satisfaction",
  },
  pl: {
    pageTitle: "Reklama i pakiety Premium",
    pageSubtitle: "Więcej widoczności. Więcej klientów. Więcej sprzedaży.",
    heroTitle: "Zwiększ zasięg na Zazarap",
    sectionTitle: "Reklama premium dla użytkowników prywatnych",
    sectionDesc: "Zwiększ widoczność ogłoszeń dzięki opcjom premium. Idealne dla sprzedających, którzy chcą sprzedać szybciej.",
    buy: "Kup teraz",
    topTitle: "Ogłoszenie TOP",
    topDesc: "Twoje ogłoszenie będzie na górze kategorii przez 7 dni.",
    highlightTitle: "Wyróżnione ogłoszenie",
    highlightDesc: "Kolorowa ramka + lepsza pozycja w wynikach wyszukiwania.",
    premium14Title: "Premium 14 dni",
    premium14Desc: "Maksymalna widoczność przez dwa tygodnie ze wszystkimi korzyściami.",
    features: "Co otrzymujesz:",
    feature1: "Priorytetowe umieszczenie",
    feature2: "Do 10x więcej wyświetleń",
    feature3: "Kolorowe wyróżnienie",
    feature4: "Większe szanse na sprzedaż",
    howItWorks: "Jak to działa",
    step1: "Wybierz pakiet",
    step1Desc: "Wybierz pakiet premium odpowiedni dla Twojego ogłoszenia",
    step2: "Zapłać",
    step2Desc: "Bezpieczna płatność przez PayPal lub Stripe",
    step3: "Natychmiastowa aktywacja",
    step3Desc: "Twoje ogłoszenie zostanie wyróżnione natychmiast",
    stats: "Nasze wyniki",
    stat1: "10x więcej widoczności",
    stat2: "3x szybsza sprzedaż",
    stat3: "95% zadowolenia",
  },
  tr: {
    pageTitle: "Reklam & Premium Paketler",
    pageSubtitle: "Daha fazla görünürlük. Daha fazla müşteri. Daha fazla satış.",
    heroTitle: "Zazarap'ta erişiminizi artırın",
    sectionTitle: "Bireysel kullanıcılar için premium reklam",
    sectionDesc: "Premium seçeneklerle ilan görünürlüğünü artırın. Daha hızlı satmak isteyenler için ideal.",
    buy: "Satın al",
    topTitle: "TOP İlan",
    topDesc: "İlanınız 7 gün boyunca kategorinin en üstünde görünür.",
    highlightTitle: "Öne çıkan ilan",
    highlightDesc: "Renkli çerçeve + arama sonuçlarında daha iyi konum.",
    premium14Title: "Premium 14 gün",
    premium14Desc: "Tüm avantajlarla iki hafta maksimum görünürlük.",
    features: "Ne elde ediyorsunuz:",
    feature1: "Öncelikli yerleştirme",
    feature2: "10 kata kadar daha fazla görüntülenme",
    feature3: "Renkli vurgulama",
    feature4: "Daha yüksek satış şansı",
    howItWorks: "Nasıl çalışır",
    step1: "Paket seçin",
    step1Desc: "İlanınıza uygun premium paketi seçin",
    step2: "Ödeyin",
    step2Desc: "PayPal veya Stripe ile güvenli ödeme",
    step3: "Hemen aktif",
    step3Desc: "İlanınız anında öne çıkarılır",
    stats: "Sonuçlarımız",
    stat1: "10x daha fazla görünürlük",
    stat2: "3x daha hızlı satış",
    stat3: "%95 memnuniyet",
  },
  uk: {
    pageTitle: "Реклама та Premium-пакети",
    pageSubtitle: "Більше видимості. Більше клієнтів. Більше продажів.",
    heroTitle: "Збільште охоплення на Zazarap",
    sectionTitle: "Premium-реклама для приватних користувачів",
    sectionDesc: "Підвищуйте видимість оголошень завдяки premium-опціям. Ідеально для тих, хто хоче продати швидше.",
    buy: "Купити",
    topTitle: "TOP-оголошення",
    topDesc: "Ваше оголошення буде вгорі категорії протягом 7 днів.",
    highlightTitle: "Виділене оголошення",
    highlightDesc: "Кольорова рамка + краща позиція в пошуку.",
    premium14Title: "Premium 14 днів",
    premium14Desc: "Максимальна видимість на два тижні з усіма перевагами.",
    features: "Що ви отримуєте:",
    feature1: "Пріоритетне розміщення",
    feature2: "До 10x більше переглядів",
    feature3: "Кольорове виділення",
    feature4: "Більші шанси продажу",
    howItWorks: "Як це працює",
    step1: "Оберіть пакет",
    step1Desc: "Виберіть premium-пакет для вашого оголошення",
    step2: "Оплатіть",
    step2Desc: "Безпечна оплата через PayPal або Stripe",
    step3: "Активація миттєво",
    step3Desc: "Ваше оголошення буде виділено негайно",
    stats: "Наші результати",
    stat1: "10x більше видимості",
    stat2: "3x швидше продаж",
    stat3: "95% задоволеності",
  },
};

export default function Werbung() {
  const { language } = useLanguage();
  const t = (key) => translations[language]?.[key] || translations['de'][key];

  const packages = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: t('topTitle'),
      description: t('topDesc'),
      price: "€9.99",
      duration: "7 Tage",
      color: "from-red-500 to-orange-500",
      badge: "Beliebt",
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: t('highlightTitle'),
      description: t('highlightDesc'),
      price: "€4.99",
      duration: "7 Tage",
      color: "from-yellow-500 to-amber-500",
      badge: "Starter",
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: t('premium14Title'),
      description: t('premium14Desc'),
      price: "€14.99",
      duration: "14 Tage",
      color: "from-purple-500 to-pink-500",
      badge: "Best Value",
    },
  ];

  return (
    <div className="py-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#d62828] via-[#f77f00] to-[#fcbf49] rounded-3xl p-12 mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-extrabold mb-4">{t('heroTitle')}</h1>
          <p className="text-xl mb-2">{t('pageSubtitle')}</p>
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{t('stat1')}</div>
              <div className="text-sm opacity-90">durchschnittlich</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{t('stat2')}</div>
              <div className="text-sm opacity-90">als Standard</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{t('stat3')}</div>
              <div className="text-sm opacity-90">unserer Kunden</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">{t('sectionTitle')}</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">{t('sectionDesc')}</p>
      </div>

      {/* Packages Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {packages.map((pkg, idx) => (
          <Card key={idx} className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-2">
            <div className={`absolute top-0 right-0 bg-gradient-to-br ${pkg.color} text-white px-3 py-1 text-xs font-bold rounded-bl-lg`}>
              {pkg.badge}
            </div>
            <CardHeader>
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${pkg.color} text-white mb-4`}>
                {pkg.icon}
              </div>
              <CardTitle className="text-2xl mb-2">{pkg.title}</CardTitle>
              <p className="text-slate-600 text-sm">{pkg.description}</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-4xl font-bold text-[#d62828] mb-1">{pkg.price}</div>
                <div className="text-sm text-slate-500">{pkg.duration}</div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('feature1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('feature2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('feature3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('feature4')}</span>
                </li>
              </ul>
              <Link to={createPageUrl('Marketplace')}>
                <Button className="w-full bg-[#d62828] hover:bg-[#b91c1c] text-white">
                  {t('buy')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How it Works */}
      <div className="bg-slate-50 rounded-2xl p-10 mb-16">
        <h3 className="text-3xl font-bold text-center mb-10">{t('howItWorks')}</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#d62828] text-white rounded-full text-2xl font-bold mb-4">
              1
            </div>
            <h4 className="text-xl font-bold mb-2">{t('step1')}</h4>
            <p className="text-slate-600">{t('step1Desc')}</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f77f00] text-white rounded-full text-2xl font-bold mb-4">
              2
            </div>
            <h4 className="text-xl font-bold mb-2">{t('step2')}</h4>
            <p className="text-slate-600">{t('step2Desc')}</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#fcbf49] text-white rounded-full text-2xl font-bold mb-4">
              3
            </div>
            <h4 className="text-xl font-bold mb-2">{t('step3')}</h4>
            <p className="text-slate-600">{t('step3Desc')}</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-[#d62828] to-[#f77f00] text-white rounded-2xl p-12">
        <Zap className="h-16 w-16 mx-auto mb-4" />
        <h3 className="text-3xl font-bold mb-4">Bereit, mehr zu verkaufen?</h3>
        <p className="text-lg mb-6 opacity-90">Starten Sie noch heute mit Premium-Werbung</p>
        <Link to={createPageUrl('Marketplace')}>
          <Button size="lg" className="bg-white text-[#d62828] hover:bg-slate-100 font-bold px-8">
            Jetzt loslegen
          </Button>
        </Link>
      </div>
    </div>
  );
}