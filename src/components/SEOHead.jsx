import { useEffect } from 'react';

export default function SEOHead({ 
  title = "Zazarap - Marketplace Italiano Sicuro",
  description = "Compra e vendi in sicurezza con sistema escrow PayPal. Marketplace italiano affidabile con protezione acquirente e venditore.",
  image = "https://zazarap.com/og-image.jpg",
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = "website",
  keywords = ''
}) {
  useEffect(() => {
    document.title = title;
    
    // Meta tags standard
    setMetaTag('description', description);
    const finalKeywords = keywords || 'marketplace, compravendita, usato, sicuro, escrow, paypal, italia';
    setMetaTag('keywords', finalKeywords);
    
    // Open Graph
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', description, 'property');
    setMetaTag('og:image', image, 'property');
    setMetaTag('og:url', url, 'property');
    setMetaTag('og:type', type, 'property');
    setMetaTag('og:site_name', 'Zazarap', 'property');
    
    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);
  }, [title, description, image, url, type, keywords]);

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