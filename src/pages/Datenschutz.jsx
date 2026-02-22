import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Datenschutz() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Datenschutzerklärung</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Verantwortlicher</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Zazarap GmbH, info@zazarap.de</p>
          <p>Sitz: Deutschland</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Verarbeitungszwecke und Rechtsgrundlagen</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 space-y-1">
            <li>Bereitstellung der Plattform (Art. 6 Abs. 1 lit. b DSGVO)</li>
            <li>Kommunikation und Support (Art. 6 Abs. 1 lit. b, f DSGVO)</li>
            <li>Betrugserkennung und Sicherheit (Art. 6 Abs. 1 lit. f DSGVO)</li>
            <li>Marketing mit Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Cookies & Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Details finden Sie in unserer Cookie-Richtlinie. Nicht-essentielle Cookies setzen wir nur mit Ihrer Einwilligung.</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Empfänger & Drittlandübermittlung</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dienstleister (z. B. Hosting, Analytik) verarbeiten Daten weisungsgebunden. Eine Drittlandübermittlung erfolgt nur bei geeigneten Garantien gem. Art. 44 ff. DSGVO.</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Speicherdauer</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Wir speichern personenbezogene Daten nur solange, wie es für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Ihre Rechte</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 space-y-1">
            <li>Auskunft, Berichtigung, Löschung, Einschränkung</li>
            <li>Datenübertragbarkeit</li>
            <li>Widerspruch gegen Direktwerbung und berechtigte Interessen</li>
            <li>Widerruf erteilter Einwilligungen</li>
            <li>Beschwerderecht bei einer Aufsichtsbehörde</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontakt Datenschutz</CardTitle>
        </CardHeader>
        <CardContent>
          <p>E-Mail: privacy@zazarap.de</p>
          <p>Stand: {new Date().toLocaleDateString('de-DE')}</p>
        </CardContent>
      </Card>
    </div>
  );
}