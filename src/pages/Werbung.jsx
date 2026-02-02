import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { t, formatEUR } from '../components/lib/i18n';
import { base44 } from '@/api/base44Client';

function formatMonthly(lang, amount) {
  const price = formatEUR(lang, amount);
  const suffix = lang === "it" ? "/ mese" : "/ Monat";
  return `${price} ${suffix}`;
}

function formatWeekly(lang, amount) {
  const price = formatEUR(lang, amount);
  const suffix = lang === "it" ? "/ settimana" : "/ Woche";
  return `${price} ${suffix}`;
}

const PRIVATE_PACKAGES = [
  { key: "top_7", titleKey: "topTitle", descKey: "topDesc", price: 4.99, ctaKey: "ctaBuy" },
  { key: "highlight", titleKey: "highlightTitle", descKey: "highlightDesc", price: 2.49, ctaKey: "ctaBuy" },
  { key: "premium_14", titleKey: "premium14Title", descKey: "premium14Desc", price: 8.99, ctaKey: "ctaBuy" },
];

const SHOP_PACKAGES = [
  {
    key: "shop_basic",
    titleKey: "shopBasicTitle",
    price: 14.99,
    period: "month",
    ctaKey: "ctaSubscribe",
    features: ["shopBasicF1", "shopBasicF2", "shopBasicF3"],
    bestseller: false,
  },
  {
    key: "shop_business",
    titleKey: "shopBusinessTitle",
    price: 39.99,
    period: "month",
    ctaKey: "ctaSubscribe",
    features: ["shopBusinessF1", "shopBusinessF2", "shopBusinessF3"],
    bestseller: true,
  },
  {
    key: "shop_premium",
    titleKey: "shopPremiumTitle",
    price: 79.99,
    period: "month",
    ctaKey: "ctaSubscribe",
    features: ["shopPremiumF1", "shopPremiumF2", "shopPremiumF3"],
    bestseller: false,
  },
];

const BANNER_PACKAGES = [
  {
    key: "banner_home",
    titleKey: "bannerHomeTitle",
    descKey: "bannerHomeDesc",
    price: 149.0,
    period: "week",
    ctaKey: "ctaBookBanner",
  },
  {
    key: "banner_category",
    titleKey: "bannerCategoryTitle",
    descKey: "bannerCategoryDesc",
    price: 79.0,
    period: "week",
    ctaKey: "ctaBookBanner",
  },
  {
    key: "banner_sidebar",
    titleKey: "bannerSidebarTitle",
    descKey: "bannerSidebarDesc",
    price: 39.0,
    period: "week",
    ctaKey: "ctaBookBanner",
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

  const styles = {
    page: { background: "#f6f7fb", minHeight: "100vh" },
    wrap: { maxWidth: 780, margin: "0 auto", padding: "22px 14px 60px" },
    section: { marginTop: 26 },
    h2: { margin: "0 0 10px", fontSize: 22, fontWeight: 950 },
    p: { margin: "0 0 16px", color: "#64748b", lineHeight: 1.55 },
    card: {
      background: "#fff",
      borderRadius: 16,
      padding: "22px 18px 18px",
      boxShadow: "0 10px 25px rgba(2,6,23,.10)",
      border: "1px solid rgba(15,23,42,.06)",
      marginBottom: 18,
      position: "relative",
      overflow: "hidden",
    },
    title: { margin: 0, fontSize: 18, fontWeight: 950, textAlign: "center" },
    desc: { margin: "10px 0 0", color: "#64748b", textAlign: "center", lineHeight: 1.55 },
    price: {
      margin: "16px 0 18px",
      color: "#d61b1b",
      fontWeight: 950,
      textAlign: "center",
      fontSize: 30,
      letterSpacing: 0.2,
    },
    btn: {
      width: "100%",
      height: 52,
      borderRadius: 14,
      border: 0,
      background: "#d61b1b",
      color: "#fff",
      fontWeight: 950,
      cursor: "pointer",
      boxShadow: "0 12px 18px rgba(214,27,27,.22)",
    },
    features: { margin: "14px 0 0", padding: 0, listStyle: "none" },
    feature: { display: "flex", gap: 10, alignItems: "flex-start", marginTop: 10, color: "#0f172a" },
    check: { color: "#d61b1b", fontWeight: 950, marginTop: 1 },
    bestsellerBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 28,
      background: "#d61b1b",
      color: "#fff",
      fontWeight: 950,
      fontSize: 12,
      letterSpacing: 0.4,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    bestsellerBorder: {
      border: "2px solid #d61b1b",
      paddingTop: 46,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        {/* 1) PRIVATE */}
        <section style={styles.section}>
          <h2 style={styles.h2}>{t(language, "sectionPrivate")}</h2>
          <p style={styles.p}>{t(language, "sectionPrivateDesc")}</p>

          {PRIVATE_PACKAGES.map((x) => (
            <div key={x.key} style={styles.card}>
              <h3 style={styles.title}>{t(language, x.titleKey)}</h3>
              <p style={styles.desc}>{t(language, x.descKey)}</p>
              <div style={styles.price}>{money.once(x.price)}</div>
              <button
                style={{ ...styles.btn, opacity: loadingKey === x.key ? 0.8 : 1 }}
                disabled={loadingKey === x.key}
                onClick={() => goCheckout(x.key)}
              >
                {loadingKey === x.key ? "…" : t(language, x.ctaKey)}
              </button>
            </div>
          ))}
        </section>

        {/* 2) SHOP */}
        <section style={styles.section}>
          <h2 style={styles.h2}>{t(language, "sectionShop")}</h2>
          <p style={styles.p}>{t(language, "sectionShopDesc")}</p>

          {SHOP_PACKAGES.map((x) => (
            <div
              key={x.key}
              style={{
                ...styles.card,
                ...(x.bestseller ? styles.bestsellerBorder : {}),
                paddingTop: x.bestseller ? 46 : 22,
              }}
            >
              {x.bestseller && <div style={styles.bestsellerBar}>{t(language, "bestseller")}</div>}

              <h3 style={styles.title}>{t(language, x.titleKey)}</h3>

              <ul style={styles.features}>
                {x.features.map((f) => (
                  <li key={f} style={styles.feature}>
                    <span style={styles.check}>✓</span>
                    <span>{t(language, f)}</span>
                  </li>
                ))}
              </ul>

              <div style={styles.price}>{money.month(x.price)}</div>

              <button
                style={{ ...styles.btn, opacity: loadingKey === x.key ? 0.8 : 1 }}
                disabled={loadingKey === x.key}
                onClick={() => goCheckout(x.key)}
              >
                {loadingKey === x.key ? "…" : t(language, x.ctaKey)}
              </button>
            </div>
          ))}
        </section>

        {/* 3) BANNERS */}
        <section style={styles.section}>
          <h2 style={styles.h2}>{t(language, "sectionBanner")}</h2>
          <p style={styles.p}>{t(language, "sectionBannerDesc")}</p>

          {BANNER_PACKAGES.map((x) => (
            <div key={x.key} style={styles.card}>
              <h3 style={styles.title}>{t(language, x.titleKey)}</h3>
              <p style={styles.desc}>{t(language, x.descKey)}</p>
              <div style={styles.price}>{money.week(x.price)}</div>
              <button
                style={{ ...styles.btn, opacity: loadingKey === x.key ? 0.8 : 1 }}
                disabled={loadingKey === x.key}
                onClick={() => goCheckout(x.key)}
              >
                {loadingKey === x.key ? "…" : t(language, x.ctaKey)}
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}