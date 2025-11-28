import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from 'lucide-react';
import { createPageUrl } from '@/utils';
import SEOHead from '@/components/SEOHead';

export default function Werbung() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <SEOHead title="Werbung & Premium-Pakete – Zazarap" description="Mehr Sichtbarkeit. Mehr Kunden. Mehr Verkäufe." />
      
      {/* Header */}
      <div className="bg-[#d62020] py-12 px-4 text-center text-white mb-10 shadow-md">
        <h1 className="text-4xl font-bold mb-3">Werbung & Premium-Pakete</h1>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">Mehr Sichtbarkeit. Mehr Kunden. Mehr Verkäufe.</p>
      </div>

      <div className="container max-w-6xl mx-auto px-4">
        
        {/* Banner */}
        <div className="w-full h-48 bg-gradient-to-br from-[#d62020] to-[#ff4b4b] rounded-2xl flex items-center justify-center text-white text-2xl md:text-4xl font-bold mb-16 shadow-xl text-center px-6 transform hover:scale-[1.01] transition-transform duration-300">
          Erhöhen Sie Ihre Reichweite auf Zazarap
        </div>

        {/* Section 1 */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left border-l-4 border-[#d62020] pl-4">Premium-Werbung für private Nutzer</h2>
          <p className="text-gray-600 mb-8 text-center md:text-left pl-5">Steigern Sie die Sichtbarkeit Ihrer Anzeigen mit unseren Premium-Optionen. Ideal für Verkäufer, die schneller verkaufen möchten.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              title="TOP-Anzeige" 
              description="Ihre Anzeige wird 7 Tage lang ganz oben in der Kategorie angezeigt."
              price="€4,99"
              btnText="Jetzt kaufen"
            />
            <PricingCard 
              title="Hervorgehobene Anzeige" 
              description="Farblicher Rahmen + besserer Platz in den Suchergebnissen."
              price="€2,49"
              btnText="Jetzt kaufen"
            />
            <PricingCard 
              title="Premium 14 Tage" 
              description="Maximale Sichtbarkeit für zwei Wochen mit allen Vorteilen."
              price="€8,99"
              btnText="Jetzt kaufen"
            />
          </div>
        </div>

        {/* Section 2 */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left border-l-4 border-[#d62020] pl-4">Werbepakete für Geschäfte & Unternehmen</h2>
          <p className="text-gray-600 mb-8 text-center md:text-left pl-5">Perfekt für Shops, Händler und professionelle Anbieter. Präsentieren Sie Ihre Marke auf Zazarap.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <PricingCard 
              title="Basic Shop-Paket" 
              features={["Eigene Shop-Seite", "Bis zu 20 aktive Anzeigen", "Standard-Unterstützung"]}
              price="€14,99 / Monat"
              btnText="Jetzt abonnieren"
            />
             <PricingCard 
              title="Business Shop-Paket" 
              features={["Bis zu 100 aktive Anzeigen", "Logo & Branding", "Werbebanner im Suchbereich"]}
              price="€39,99 / Monat"
              btnText="Jetzt abonnieren"
              highlighted={true}
            />
             <PricingCard 
              title="Premium Shop-Paket" 
              features={["Unbegrenzte Anzeigen", "Startseiten-Banner", "Priorisierter Support"]}
              price="€79,99 / Monat"
              btnText="Jetzt abonnieren"
            />
          </div>
        </div>

        {/* Section 3 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left border-l-4 border-[#d62020] pl-4">Werbebanner & Grafikpromotion</h2>
          <p className="text-gray-600 mb-8 text-center md:text-left pl-5">Platzieren Sie Ihren Banner an strategischen Orten auf Zazarap.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              title="Startseiten-Banner" 
              description="Perfekt für maximale Sichtbarkeit."
              price="€149,00 / Woche"
              btnText="Banner buchen"
            />
            <PricingCard 
              title="Kategorie-Banner" 
              description="Direkt in der passenden Kategorie für Ihre Zielgruppe."
              price="€79,00 / Woche"
              btnText="Banner buchen"
            />
            <PricingCard 
              title="Sidebar-Werbung" 
              description="Eine günstige, aber sichtbare Werbefläche."
              price="€39,00 / Woche"
              btnText="Banner buchen"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

function PricingCard({ title, description, features, price, btnText, highlighted = false }) {
  return (
    <Card className={`h-full border-none shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ${highlighted ? 'ring-2 ring-[#d62020] scale-105 relative z-10' : ''}`}>
      {highlighted && (
        <div className="bg-[#d62020] text-white text-xs font-bold text-center py-1 uppercase tracking-wider">
          Bestseller
        </div>
      )}
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center pt-0">
        {description && <p className="text-gray-600 text-center mb-6 px-2">{description}</p>}
        
        {features && (
          <ul className="space-y-3 mb-8 w-full px-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600 text-left">
                <Check className="h-5 w-5 text-[#d62020] shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        )}
        
        <div className="mt-auto w-full text-center">
          <div className="text-3xl font-bold text-[#d62020] mb-6">{price}</div>
          <Button className="w-full bg-[#d62020] hover:bg-[#b91818] text-white font-bold py-6 text-lg rounded-xl transition-colors shadow-md hover:shadow-lg">
            {btnText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}