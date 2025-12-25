import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AGB() {
  return (
    <div className="py-8 max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Allgemeine Geschäftsbedingungen (AGB)</h1>
      <p className="text-sm text-slate-600 mb-6">für die Online-Plattform zazarap.de</p>
      <p className="text-sm text-slate-600 mb-6">Gültig ab: 25.12.2025</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 1 Geltungsbereich und Vertragspartner</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>
            (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für die Nutzung der Online-Plattform zazarap.de (nachfolgend „Plattform").
          </p>
          <p>
            (2) Betreiber der Plattform zazarap.de ist:
          </p>
          <div className="ml-6 space-y-1">
            <p>Tornabene Giovanni</p>
            <p>Kronenstraße 10</p>
            <p>75245 Neulingen</p>
            <p>Deutschland</p>
            <p>E-Mail: <a href="mailto:info@zazarap.com" className="text-blue-600 hover:underline">info@zazarap.com</a></p>
          </div>
          <p>
            (3) Die Plattform zazarap.de ermöglicht es registrierten Nutzern, Waren anzubieten (Verkäufer) und zu kaufen (Käufer).
          </p>
          <p>
            (4) Mit der Registrierung auf zazarap.de akzeptiert der Nutzer diese AGB. Abweichende AGB des Nutzers werden nicht anerkannt, es sei denn, wir stimmen ihrer Geltung ausdrücklich schriftlich zu.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 2 Registrierung und Nutzerkonto</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>
            (1) Zur Nutzung der Plattform zazarap.de ist eine Registrierung erforderlich. Der Nutzer muss mindestens 18 Jahre alt sein.
          </p>
          <p>
            (2) Der Nutzer verpflichtet sich, bei der Registrierung auf zazarap.de wahrheitsgemäße Angaben zu machen und diese aktuell zu halten.
          </p>
          <p>
            (3) Der Zugang zum Nutzerkonto auf zazarap.de ist durch ein Passwort geschützt. Der Nutzer ist verpflichtet, das Passwort geheim zu halten.
          </p>
          <p>
            (4) Jeder Nutzer darf auf zazarap.de nur ein Nutzerkonto führen. Die Weitergabe des Nutzerkontos an Dritte ist untersagt.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 3 Vertragsschluss</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>
            (1) Die Einstellung eines Angebots auf zazarap.de durch den Verkäufer stellt kein bindendes Angebot dar, sondern eine Aufforderung zur Kontaktaufnahme.
          </p>
          <p>
            (2) Der Kaufvertrag kommt ausschließlich zwischen Käufer und Verkäufer zustande. zazarap.de ist nicht Vertragspartei.
          </p>
          <p>
            (3) Durch die Einigung zwischen Käufer und Verkäufer über Preis und Übergabebedingungen kommt ein rechtsverbindlicher Kaufvertrag zustande.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 4 Pflichten des Verkäufers</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>(1) Der Verkäufer verpflichtet sich insbesondere:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>nur Waren anzubieten, die er rechtmäßig besitzt und verkaufen darf</li>
            <li>wahrheitsgemäße und vollständige Produktbeschreibungen auf zazarap.de zu erstellen</li>
            <li>den vereinbarten Preis einzuhalten</li>
            <li>die Ware ordnungsgemäß zu verpacken und zu versenden</li>
            <li>bei gewerblichem Verkauf alle gesetzlichen Pflichten zu erfüllen (z. B. Widerrufsrecht, Gewährleistung)</li>
          </ul>
          <p>
            (2) Der Verkäufer haftet allein für die Richtigkeit seiner Angaben und die Einhaltung gesetzlicher Vorschriften.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 5 Pflichten des Käufers</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>(1) Der Käufer verpflichtet sich insbesondere:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>den vereinbarten Kaufpreis fristgerecht zu zahlen</li>
            <li>eine korrekte Lieferadresse anzugeben</li>
            <li>die Ware unverzüglich nach Erhalt zu prüfen</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 6 Zahlung und Zahlungsabwicklung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>
            (1) Die Zahlung auf zazarap.de erfolgt über die von der Plattform bereitgestellten Zahlungsmethoden (z. B. PayPal).
          </p>
          <p>
            (2) zazarap.de bietet kein eigenes Treuhand- oder Escrow-System an. Die Zahlungsabwicklung erfolgt ausschließlich über den jeweiligen Zahlungsdienstleister gemäß dessen Nutzungsbedingungen.
          </p>
          <p>
            (3) zazarap.de kann für erfolgreich vermittelte Verkäufe eine Provision in Höhe von 5 % des Verkaufspreises erheben.
          </p>
          <p>
            (4) Preise auf zazarap.de verstehen sich inklusive der gesetzlichen Mehrwertsteuer, soweit diese anfällt.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 7 Widerrufsrecht</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>
            (1) Bei Käufen über zazarap.de von gewerblichen Verkäufern steht Verbrauchern grundsätzlich ein gesetzliches Widerrufsrecht zu.
          </p>
          <p>
            (2) Bei Käufen über zazarap.de von privaten Verkäufern besteht kein Widerrufsrecht.
          </p>
          <p>
            (3) Für die ordnungsgemäße Widerrufsbelehrung ist ausschließlich der jeweilige Verkäufer verantwortlich.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 8 Gewährleistung und Haftung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>
            (1) zazarap.de haftet nicht für die Qualität, Sicherheit oder Rechtmäßigkeit der von Nutzern angebotenen Waren.
          </p>
          <p>
            (2) Für Mängel an der Ware ist ausschließlich der Verkäufer verantwortlich. Es gelten die gesetzlichen Gewährleistungsrechte.
          </p>
          <p>
            (3) zazarap.de haftet nur für Vorsatz und grobe Fahrlässigkeit. Bei leichter Fahrlässigkeit haftet zazarap.de nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) und beschränkt auf den vorhersehbaren Schaden.
          </p>
          <p>
            (4) Die Haftung für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie nach dem Produkthaftungsgesetz bleibt unberührt.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 9 Streitbeilegung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>
            (1) Bei Streitigkeiten zwischen Käufer und Verkäufer auf zazarap.de können beide Parteien das interne Dispute-Center nutzen.
          </p>
          <p>
            (2) zazarap.de ist nicht verpflichtet, an Streitbeilegungsverfahren teilzunehmen.
          </p>
          <p>
            (3) Plattform der EU zur Online-Streitbeilegung:{' '}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 10 Datenschutz</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p>
            Die Verarbeitung personenbezogener Daten auf zazarap.de erfolgt gemäß der Datenschutzerklärung und der Datenschutz-Grundverordnung (DSGVO).
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 11 Verbotene Angebote</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>Auf zazarap.de sind insbesondere untersagt:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Waffen, Munition und explosionsgefährliche Stoffe</li>
            <li>Betäubungsmittel gemäß BtMG</li>
            <li>verschreibungspflichtige Arzneimittel</li>
            <li>pornografische oder jugendgefährdende Inhalte</li>
            <li>geschützte Tierarten</li>
            <li>Markenfälschungen</li>
            <li>verfassungswidrige Inhalte</li>
            <li>gefährliche Chemikalien</li>
            <li>illegale Dienstleistungen</li>
            <li>Glücksspiel- und Wettangebote</li>
            <li>sonstige gesetzlich verbotene Produkte</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 12 Moderation und Sanktionen</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>
            zazarap.de setzt automatische sowie manuelle Prüfungen ein. Bei Verstößen können folgende Maßnahmen erfolgen:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Verwarnung</li>
            <li>vorübergehende Sperrung</li>
            <li>dauerhafte Kontoschließung</li>
            <li>Weitergabe an Behörden bei schweren Verstößen</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 13 Sperrung und Kündigung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>
            (1) Nutzer können ihr Nutzerkonto auf zazarap.de jederzeit kündigen.
          </p>
          <p>
            (2) zazarap.de kann Nutzerkonten bei Verstößen sperren oder löschen.
          </p>
          <p>
            (3) Bereits geschlossene Verträge zwischen Nutzern bleiben unberührt.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>§ 14 Schlussbestimmungen</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>
            (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
          </p>
          <p>
            (2) Gerichtsstand ist – soweit gesetzlich zulässig – der Sitz des Betreibers.
          </p>
          <p>
            (3) Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
          </p>
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-slate-100 rounded-lg text-center">
        <p className="font-semibold text-slate-800">zazarap.de</p>
        <p className="text-sm text-slate-600">Der sichere und zuverlässige deutsche Marktplatz</p>
      </div>
    </div>
  );
}