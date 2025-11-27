import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Impressum() {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Impressum</h1>
      <p className="text-sm text-slate-600 mb-6">Angaben gemäß § 5 TMG</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Betreiber der Plattform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Firmenname:</strong> [Ihre Firma GmbH]</p>
          <p><strong>Anschrift:</strong> [Straße und Hausnummer]<br/>
          [PLZ Ort]<br/>
          Deutschland</p>
          <p><strong>Geschäftsführer:</strong> [Name]</p>
          <p><strong>Registergericht:</strong> [Amtsgericht Ort]</p>
          <p><strong>Registernummer:</strong> HRB [Nummer]</p>
          <p><strong>USt-IdNr.:</strong> DE[Nummer]</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Kontakt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Telefon:</strong> +49 (0) XXX XXXXXXX</p>
          <p><strong>E-Mail:</strong> <a href="mailto:infozazarap@gmail.com" className="text-blue-600 hover:underline">infozazarap@gmail.com</a></p>
          <p><strong>Website:</strong> www.zazarap.de</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Verantwortlich für den Inhalt</CardTitle>
        </CardHeader>
        <CardContent>
          <p>nach § 55 Abs. 2 RStV:<br/>
          [Name]<br/>
          [Adresse]</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Streitschlichtung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Haftungsausschluss</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Haftung für Inhalte</h3>
            <p className="text-sm text-slate-700">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen 
              zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Haftung für Links</h3>
            <p className="text-sm text-slate-700">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der 
              verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Urheberrecht</h3>
            <p className="text-sm text-slate-700">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}