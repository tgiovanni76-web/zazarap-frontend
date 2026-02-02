import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { t, formatEUR } from '../components/lib/i18n';
import { base44 } from '@/api/base44Client';

const PACKAGES = [
  {
    key: "top_7",
    price: 4.99,
    titleKey: "topTitle",
    descKey: "topDesc",
    icon: <TrendingUp className="h-8 w-8" />,
    color: "from-red-500 to-orange-500",
    badge: "Beliebt",
  },
  {
    key: "highlight",
    price: 2.49,
    titleKey: "highlightTitle",
    descKey: "highlightDesc",
    icon: <Star className="h-8 w-8" />,
    color: "from-yellow-500 to-amber-500",
    badge: "Starter",
  },
  {
    key: "premium_14",
    price: 8.99,
    titleKey: "premium14Title",
    descKey: "premium14Desc",
    icon: <Sparkles className="h-8 w-8" />,
    color: "from-purple-500 to-pink-500",
    badge: "Best Value",
  },
];

export default function Werbung() {
  const { language } = useLanguage();
  const [loadingKey, setLoadingKey] = useState(null);

  const money = useMemo(() => {
    return {
      once: (amt) => formatEUR(language, amt),
      month: (amt) => formatMonthly(language, amt),
      week: (amt) => formatWeekly(language, amt),
    };
  }, [language]);

  async function goCheckout(productKey) {
    setLoadingKey(productKey);
    try {
      const { data } = await base44.functions.invoke('createPremiumPackageOrder', { packageKey: productKey });
      if (data.approveUrl) {
        window.location.href = data.approveUrl;
      }
    } catch (error) {
      console.error('Error:', error);
      alert(language === "it" ? "Errore durante la creazione dell'ordine" : "Fehler bei der Bestellung");
      setLoadingKey(null);
    }
  }

  return (
    <div style={{ background: "#f6f7fb", minHeight: "100vh", marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16 }}>
      {/* Hero Banner */}
      <section
        style={{
          marginTop: -32,
          background: "linear-gradient(180deg,#d71d1d 0%,#ff4a4a 100%)",
          borderRadius: 14,
          boxShadow: "0 10px 30px rgba(2,6,23,.10)",
          padding: "54px 22px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, color: "#fff", fontWeight: 900, fontSize: "clamp(28px,4vw,44px)" }}>
          {t(language, "pageTitle")}
        </h1>
        <p style={{ margin: "10px 0 0", color: "#fff", opacity: 0.92, fontWeight: 700, fontSize: 18 }}>
          {t(language, "pageSubtitle")}
        </p>
      </section>

      {/* Main Content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 0 60px" }}>
        {/* Section Title */}
        <section style={{ marginTop: 34 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span
              aria-hidden="true"
              style={{ width: 6, height: 32, marginTop: 4, borderRadius: 4, background: "#d61b1b" }}
            />
            <div>
              <h2 style={{ margin: 0, fontSize: "clamp(20px,2.6vw,28px)", fontWeight: 900 }}>
                {t(language, "sectionTitle")}
              </h2>
              <p style={{ margin: "8px 0 0", color: "#64748b", lineHeight: 1.55 }}>
                {t(language, "sectionDesc")}
              </p>
            </div>
          </div>

          {/* Packages Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {PACKAGES.map((pkg) => (
              <Card key={pkg.key} className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-2">
                <div className={`absolute top-0 right-0 bg-gradient-to-br ${pkg.color} text-white px-3 py-1 text-xs font-bold rounded-bl-lg`}>
                  {pkg.badge}
                </div>
                <CardHeader>
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${pkg.color} text-white mb-4`}>
                    {pkg.icon}
                  </div>
                  <CardTitle className="text-2xl mb-2">{t(language, pkg.titleKey)}</CardTitle>
                  <p className="text-slate-600 text-sm">{t(language, pkg.descKey)}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-[#d62828] mb-1">
                      {formatEUR(language, pkg.price)}
                    </div>
                    <div className="text-sm text-slate-500">7 Tage</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Vorrangige Platzierung</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Bis zu 10x mehr Aufrufe</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Farbliche Hervorhebung</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Höhere Verkaufschancen</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-[#d62828] hover:bg-[#b91c1c] text-white"
                    onClick={async () => {
                      try {
                        const { data } = await base44.functions.invoke('createPremiumPackageOrder', { packageKey: pkg.key });
                        if (data.approveUrl) {
                          window.location.href = data.approveUrl;
                        }
                      } catch (error) {
                        console.error('Error:', error);
                        alert('Errore durante la creazione dell\'ordine');
                      }
                    }}
                  >
                    {t(language, "buy")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-slate-50 rounded-2xl p-10 mt-12">
          <h3 className="text-3xl font-bold text-center mb-10">So funktioniert's</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#d62828] text-white rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h4 className="text-xl font-bold mb-2">Paket wählen</h4>
              <p className="text-slate-600">Wählen Sie das passende Premium-Paket für Ihre Anzeige</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f77f00] text-white rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h4 className="text-xl font-bold mb-2">Bezahlen</h4>
              <p className="text-slate-600">Sichere Zahlung per PayPal oder Stripe</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#fcbf49] text-white rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h4 className="text-xl font-bold mb-2">Sofort aktiv</h4>
              <p className="text-slate-600">Ihre Anzeige wird sofort hervorgehoben</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-[#d62828] to-[#f77f00] text-white rounded-2xl p-12 mt-12">
          <Zap className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-3xl font-bold mb-4">Bereit, mehr zu verkaufen?</h3>
          <p className="text-lg mb-6 opacity-90">Starten Sie noch heute mit Premium-Werbung</p>
          <Link to={createPageUrl('Marketplace')}>
            <Button size="lg" className="bg-white text-[#d62828] hover:bg-slate-100 font-bold px-8">
              Jetzt loslegen
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}