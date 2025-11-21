import { useEffect } from 'react';

export default function StructuredData({ type, data }) {
  useEffect(() => {
    let schema = {};

    if (type === 'product' && data.listing) {
      schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": data.listing.title,
        "description": data.listing.description,
        "image": data.listing.images?.[0],
        "offers": {
          "@type": "Offer",
          "price": data.listing.price,
          "priceCurrency": "EUR",
          "availability": data.listing.status === 'active' 
            ? "https://schema.org/InStock" 
            : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Person",
            "name": data.listing.created_by
          }
        }
      };
      
      if (data.rating) {
        schema.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": data.rating,
          "reviewCount": data.reviewCount
        };
      }
    }

    if (type === 'organization') {
      schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Zazarap",
        "url": "https://zazarap.com",
        "logo": "https://zazarap.com/logo.png",
        "description": "Marketplace italiano sicuro con sistema escrow",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Support",
          "email": "support@zazarap.com"
        }
      };
    }

    // Inserisci schema nel DOM
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    script.id = `structured-data-${type}`;
    
    // Rimuovi vecchi script
    const old = document.getElementById(script.id);
    if (old) old.remove();
    
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(script.id);
      if (el) el.remove();
    };
  }, [type, data]);

  return null;
}