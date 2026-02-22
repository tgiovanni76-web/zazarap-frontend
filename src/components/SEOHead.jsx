import { useEffect } from 'react';

export default function SEOHead({ 
  title = "Zazarap.de - Kleinanzeigen",
  description = "Zazarap.de: Kleinanzeigen-Marktplatz mit sicherem Handel.",
  image = "https://zazarap.de/og-image.jpg",
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = "website",
  keywords = '',
  googleVerification = ''
}) {
  useEffect(() => {
    document.title = title;
    
    // Meta tags standard
    setMetaTag('description', description);
    const finalKeywords = keywords || 'marketplace, compravendita, usato, sicuro, escrow, paypal, italia';
    setMetaTag('keywords', finalKeywords);
    setMetaTag('theme-color', '#1F3C88');
    
    // Open Graph
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', description, 'property');
    setMetaTag('og:image', image, 'property');
    setMetaTag('og:url', url, 'property');
    setMetaTag('og:type', type, 'property');
    setMetaTag('og:site_name', 'Zazarap.de', 'property');
    
    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);

    if (googleVerification) {
      setMetaTag('google-site-verification', googleVerification);
    }
  }, [title, description, image, url, type, keywords, googleVerification]);

  return null;
}

function setMetaTag(name, content, attribute = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}