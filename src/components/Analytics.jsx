import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Analytics() {
  const location = useLocation();

  useEffect(() => {
    // Google Analytics pageview tracking
    const GA_ID = process.env.REACT_APP_GA_ID || 'G-6EWH7J0RLD';
    if (window.gtag && GA_ID !== 'G-6EWH7J0RLD') {
      window.gtag('config', GA_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  useEffect(() => {
    // Usa l'ID da variabili ambiente o placeholder
    const GA_ID = process.env.REACT_APP_GA_ID || 'G-6EWH7J0RLD';
    
    // Carica Google Analytics solo se configurato
    if (GA_ID && GA_ID !== 'G-6EWH7J0RLD') {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA_ID, {
        send_page_view: false // Gestito manualmente
      });
    }
  }, []);

  return null;
}

// Event tracking helper
export function trackEvent(category, action, label, value) {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  } else {
    console.log('Analytics event:', { category, action, label, value });
  }
}

// E-commerce tracking
export function trackPurchase(transactionId, value, items) {
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: 'EUR',
      items: items
    });
  } else {
    console.log('Analytics purchase:', { transactionId, value, items });
  }
}