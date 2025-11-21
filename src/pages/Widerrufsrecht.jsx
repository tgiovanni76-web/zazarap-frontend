import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Widerrufsrecht() {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Widerrufsrecht für Verbraucher</h1>
      <p className="text-sm text-slate-600 mb-6">Informationen gemäß § 312g BGB</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Widerrufsbelehrung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-slate-700">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-bold mb-2">Widerrufsrecht</h3>
              <p>
                Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
              </p>
              <p className="mt-2">
                Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, 
                der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Um Ihr Widerrufsrecht auszuüben, müssen Sie uns</h3>
              <p className="mb-2">
                <strong>[Ihre Firma GmbH]</strong><br/>
                [Straße und Hausnummer]<br/>
                [PLZ Ort]<br/>
                Deutschland<br/>
                E-Mail: widerruf@zazarap.de<br/>
                Telefon: +49 (0) XXX XXXXXXX
              </p>
              <p>
                mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief oder E-Mail) über Ihren 
                Entschluss, diesen Vertrag zu widerrufen, informieren.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Widerrufsfrist</h3>
              <p>
                Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des 
                Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Folgen des Widerrufs</h3>
              <p>
                Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, 
                einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass 
                Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt 
                haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die 
                Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
              </p>
              <p className="mt-2">
                Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen 
                Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; 
                in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle>Wichtiger Hinweis für Privatverkäufe (C2C)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">
            <strong>Achtung:</strong> Das gesetzliche Widerrufsrecht gilt nur für Verträge zwischen Unternehmern und 
            Verbrauchern. Bei Käufen von Privatpersonen (C2C-Verkäufe) auf dieser Plattform besteht in der Regel 
            <strong> kein gesetzliches Widerrufsrecht</strong>. Die Gewährleistungsrechte richten sich nach den 
            individuellen Vereinbarungen zwischen Käufer und Verkäufer.
          </p>
          <p className="text-sm text-slate-700 mt-2">
            Wir empfehlen allen Nutzern, vor dem Kauf die Verkaufsbedingungen zu klären und bei Unklarheiten den 
            Verkäufer zu kontaktieren.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ausnahmen vom Widerrufsrecht</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 mb-2">
            Das Widerrufsrecht besteht nicht bei Verträgen:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            <li>zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle 
            Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist</li>
            <li>zur Lieferung von Waren, die schnell verderben können oder deren Verfallsdatum schnell überschritten 
            würde</li>
            <li>zur Lieferung versiegelter Waren, die aus Gründen des Gesundheitsschutzes oder der Hygiene nicht zur 
            Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde</li>
            <li>zur Lieferung von Waren, die nach der Lieferung aufgrund ihrer Beschaffenheit untrennbar mit anderen 
            Gütern vermischt wurden</li>
          </ul>
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500">
        <p className="text-sm text-blue-900">
          <strong>Muster-Widerrufsformular</strong> können Sie auf unserer Supportseite herunterladen oder per E-Mail 
          an widerruf@zazarap.de anfordern.
        </p>
      </div>
    </div>
  );
}