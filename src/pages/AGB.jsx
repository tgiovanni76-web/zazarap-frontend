import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AGB() {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Allgemeine Geschäftsbedingungen (AGB)</h1>
      <p className="text-sm text-slate-600 mb-6">Gültig ab: {new Date().toLocaleDateString('de-DE')}</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 1 Geltungsbereich und Vertragspartner</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten für die Nutzung der 
            Online-Plattform Zazarap (nachfolgend "Plattform"), die von [Ihre Firma GmbH] betrieben wird.
          </p>
          <p>
            (2) Die Plattform ermöglicht es registrierten Nutzern, Waren anzubieten (Verkäufer) und zu kaufen (Käufer).
          </p>
          <p>
            (3) Mit der Registrierung akzeptiert der Nutzer diese AGB. Abweichende AGB des Nutzers werden nicht 
            anerkannt, es sei denn, wir stimmen ihrer Geltung ausdrücklich schriftlich zu.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 2 Registrierung und Nutzerkonto</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            (1) Zur Nutzung der Plattform ist eine Registrierung erforderlich. Der Nutzer muss mindestens 18 Jahre 
            alt sein.
          </p>
          <p>
            (2) Der Nutzer verpflichtet sich, wahrheitsgemäße Angaben zu machen und diese aktuell zu halten.
          </p>
          <p>
            (3) Der Zugang zum Nutzerkonto ist durch ein Passwort geschützt. Der Nutzer ist verpflichtet, das 
            Passwort geheim zu halten.
          </p>
          <p>
            (4) Jeder Nutzer darf nur ein Nutzerkonto führen. Die Weitergabe des Nutzerkontos an Dritte ist 
            untersagt.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 3 Vertragsschluss</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            (1) Die Einstellung eines Angebots durch den Verkäufer stellt noch kein bindendes Angebot dar, sondern 
            eine Aufforderung an andere Nutzer, ein Angebot abzugeben.
          </p>
          <p>
            (2) Der Kaufvertrag kommt ausschließlich zwischen Käufer und Verkäufer zustande. Die Plattform ist nicht 
            Vertragspartei.
          </p>
          <p>
            (3) Durch die Kontaktaufnahme über die Plattform und die Einigung über Preis und Lieferbedingungen kommt 
            ein rechtsverbindlicher Kaufvertrag zustande.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 4 Pflichten des Verkäufers</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>(1) Der Verkäufer verpflichtet sich:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Nur Waren anzubieten, die er rechtmäßig besitzt und verkaufen darf</li>
            <li>Wahrheitsgemäße und vollständige Produktbeschreibungen zu erstellen</li>
            <li>Den vereinbarten Preis einzuhalten</li>
            <li>Die Ware ordnungsgemäß zu verpacken und zu versenden</li>
            <li>Bei gewerblichem Verkauf die gesetzlichen Pflichten zu erfüllen (z.B. Widerrufsrecht, Gewährleistung)</li>
          </ul>
          <p>
            (2) Der Verkäufer haftet für die Richtigkeit seiner Angaben und die Einhaltung gesetzlicher Vorschriften.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 5 Pflichten des Käufers</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>(1) Der Käufer verpflichtet sich:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Den vereinbarten Kaufpreis fristgerecht zu zahlen</li>
            <li>Eine korrekte Lieferadresse anzugeben</li>
            <li>Die Ware unverzüglich nach Erhalt zu prüfen</li>
            <li>Den Erhalt der Ware zu bestätigen</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 6 Zahlung und Escrow-System</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            (1) Die Zahlung erfolgt über die von der Plattform bereitgestellten Zahlungsmethoden.
          </p>
          <p>
            (2) Bei PayPal-Zahlungen wird ein Escrow-System verwendet: Der Kaufpreis wird bis zur Bestätigung des 
            Warenempfangs durch den Käufer einbehalten und erst dann an den Verkäufer ausgezahlt.
          </p>
          <p>
            (3) Die Plattform behält eine Provision von 5% des Verkaufspreises ein.
          </p>
          <p>
            (4) Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer, soweit diese anfällt.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 7 Gewährleistung und Haftung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            (1) Die Plattform haftet nicht für die Qualität, Sicherheit oder Rechtmäßigkeit der angebotenen Waren.
          </p>
          <p>
            (2) Für Mängel an der Ware ist ausschließlich der Verkäufer verantwortlich. Es gelten die gesetzlichen 
            Gewährleistungsrechte.
          </p>
          <p>
            (3) Die Plattform haftet nur für Vorsatz und grobe Fahrlässigkeit, außer bei Verletzung wesentlicher 
            Vertragspflichten.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 8 Streitbeilegung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            (1) Bei Streitigkeiten zwischen Käufer und Verkäufer können beide Parteien das interne Dispute-Center 
            nutzen.
          </p>
          <p>
            (2) Die Plattform kann bei der Vermittlung helfen, ist aber nicht verpflichtet, eine Lösung 
            herbeizuführen.
          </p>
          <p>
            (3) Link zur EU-Streitschlichtungsplattform: 
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" className="text-blue-600 hover:underline ml-1">
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 9 Datenschutz</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p>
            Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung und der 
            Datenschutz-Grundverordnung (DSGVO).
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 10 Sperrung und Kündigung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            (1) Wir können Nutzerkonten bei Verstößen gegen diese AGB sperren oder löschen.
          </p>
          <p>
            (2) Beide Parteien können das Nutzerkonto jederzeit ohne Angabe von Gründen kündigen.
          </p>
          <p>
            (3) Laufende Transaktionen müssen ordnungsgemäß abgeschlossen werden.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>§ 11 Schlussbestimmungen</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
          </p>
          <p>
            (2) Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz der Plattform.
          </p>
          <p>
            (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen 
            Bestimmungen unberührt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}