import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DatenschutzDE() {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Datenschutzerklärung</h1>
      <p className="text-sm text-slate-600 mb-6">Gemäß Art. 13, 14 DSGVO</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. Name und Kontaktdaten des Verantwortlichen</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p><strong>[Ihre Firma GmbH]</strong><br/>
          [Straße und Hausnummer]<br/>
          [PLZ Ort]<br/>
          Deutschland<br/>
          E-Mail: datenschutz@zazarap.de<br/>
          Telefon: +49 (0) XXX XXXXXXX</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>2. Erhebung und Speicherung personenbezogener Daten</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">2.1 Bei Registrierung</h3>
            <p>Bei der Registrierung werden folgende Daten erhoben:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>E-Mail-Adresse (Pflicht)</li>
              <li>Name (Pflicht)</li>
              <li>Passwort (verschlüsselt gespeichert)</li>
              <li>Registrierungsdatum und IP-Adresse</li>
            </ul>
            <p className="mt-2">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2.2 Bei Transaktionen</h3>
            <p>Für die Abwicklung von Käufen und Verkäufen speichern wir:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Liefer- und Rechnungsdaten</li>
              <li>Zahlungsinformationen (über PayPal)</li>
              <li>Kommunikation zwischen Käufer und Verkäufer</li>
              <li>Transaktionsverlauf</li>
            </ul>
            <p className="mt-2">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und lit. c 
              (rechtliche Verpflichtung gemäß § 147 AO - Aufbewahrungspflichten)
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2.3 Cookies und Tracking</h3>
            <p>
              Wir verwenden technisch notwendige Cookies zur Funktionsfähigkeit der Plattform. Mit Ihrer Einwilligung 
              nutzen wir auch Analyse-Cookies (Google Analytics) zur Verbesserung unseres Angebots.
            </p>
            <p className="mt-2">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) und lit. f DSGVO 
              (berechtigtes Interesse)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3. Weitergabe von Daten</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>Eine Weitergabe Ihrer Daten erfolgt nur in folgenden Fällen:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>An Transaktionspartner:</strong> Für die Abwicklung von Käufen/Verkäufen</li>
            <li><strong>PayPal:</strong> Zur Zahlungsabwicklung (siehe PayPal-Datenschutzerklärung)</li>
            <li><strong>Versanddienstleister:</strong> Zur Zustellung von Waren</li>
            <li><strong>Behörden:</strong> Bei rechtlicher Verpflichtung</li>
          </ul>
          <p className="mt-2">
            Ihre Daten werden nicht an Dritte zu Werbezwecken verkauft oder weitergegeben.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>4. Ihre Rechte als betroffene Person</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>Sie haben nach der DSGVO folgende Rechte:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Art. 15 DSGVO:</strong> Recht auf Auskunft über Ihre gespeicherten Daten</li>
            <li><strong>Art. 16 DSGVO:</strong> Recht auf Berichtigung unrichtiger Daten</li>
            <li><strong>Art. 17 DSGVO:</strong> Recht auf Löschung ("Recht auf Vergessenwerden")</li>
            <li><strong>Art. 18 DSGVO:</strong> Recht auf Einschränkung der Verarbeitung</li>
            <li><strong>Art. 20 DSGVO:</strong> Recht auf Datenübertragbarkeit</li>
            <li><strong>Art. 21 DSGVO:</strong> Widerspruchsrecht gegen die Verarbeitung</li>
            <li><strong>Art. 7 Abs. 3 DSGVO:</strong> Recht auf Widerruf erteilter Einwilligungen</li>
          </ul>
          <p className="mt-3">
            <strong>Kontakt:</strong> datenschutz@zazarap.de
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>5. Beschwerderecht bei der Aufsichtsbehörde</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p className="mb-2">
            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren:
          </p>
          <p>
            <strong>Landesdatenschutzbeauftragte</strong><br/>
            (Je nach Bundesland - Beispiel für Berlin:)<br/>
            Berliner Beauftragte für Datenschutz und Informationsfreiheit<br/>
            Friedrichstr. 219, 10969 Berlin<br/>
            Website: <a href="https://www.datenschutz-berlin.de" target="_blank" className="text-blue-600 hover:underline">
              www.datenschutz-berlin.de
            </a>
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>6. Speicherdauer</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Nutzerdaten:</strong> Bis zur Löschung des Kontos</li>
            <li><strong>Transaktionsdaten:</strong> 10 Jahre (gemäß § 147 AO Aufbewahrungspflicht)</li>
            <li><strong>Kommunikation:</strong> Bis zur Löschung des Kontos oder Ablauf der Gewährleistungsfrist</li>
            <li><strong>Sicherheitslogs:</strong> 90 Tage</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Datensicherheit</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p>
            Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen zufällige oder 
            vorsätzliche Manipulationen, Verlust, Zerstörung oder den Zugriff unberechtigter Personen zu schützen. 
            Dazu gehören SSL-Verschlüsselung, verschlüsselte Passwort-Speicherung und regelmäßige Sicherheitsaudits.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}