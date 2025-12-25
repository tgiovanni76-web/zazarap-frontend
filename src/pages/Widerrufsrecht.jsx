import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Widerrufsrecht() {
  return (
    <div className="py-8 max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Widerrufsbelehrung</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Widerrufsrecht</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>
            Verbraucher haben das Recht, bei Verträgen mit gewerblichen Verkäufern, binnen vierzehn Tagen ohne Angabe von Gründen den Vertrag zu widerrufen.
          </p>
          <p>
            Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem der Verbraucher oder ein von ihm benannter Dritter, der nicht der Beförderer ist, die Ware in Besitz genommen hat.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ausübung des Widerrufsrechts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>
            Der Widerruf ist <strong>direkt gegenüber dem jeweiligen gewerblichen Verkäufer</strong> zu erklären.
          </p>
          <p>
            Die Kontaktdaten des Verkäufers (Name, Anschrift, E-Mail-Adresse) sind dem jeweiligen Angebot auf zazarap.de zu entnehmen.
          </p>
          <p className="font-semibold text-amber-700">
            Eine Mitteilung an zazarap GmbH ist nicht ausreichend, da zazarap.de nicht Vertragspartner des Kaufvertrags ist.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Folgen des Widerrufs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>
            Widerruft der Verbraucher den Vertrag, hat der jeweilige Verkäufer alle vom Verbraucher erhaltenen Zahlungen, einschließlich der Lieferkosten (mit Ausnahme zusätzlicher Kosten für eine andere als die günstigste Standardlieferung), unverzüglich und spätestens binnen vierzehn Tagen ab Zugang des Widerrufs zurückzuzahlen.
          </p>
          <p>
            Für die Rückzahlung ist dasselbe Zahlungsmittel zu verwenden, das bei der ursprünglichen Transaktion eingesetzt wurde, es sei denn, es wurde ausdrücklich etwas anderes vereinbart.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-yellow-50 border-yellow-300">
        <CardHeader>
          <CardTitle className="text-amber-800">Wichtiger Hinweis zu Privatverkäufen (C2C)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>
            Das gesetzliche Widerrufsrecht besteht <strong>ausschließlich bei Verträgen zwischen Verbrauchern und gewerblichen Verkäufern</strong>.
          </p>
          <p className="font-semibold text-amber-800">
            Bei Käufen von privaten Verkäufern (C2C) auf zazarap.de besteht kein gesetzliches Widerrufsrecht.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ausnahmen vom Widerrufsrecht</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>Das Widerrufsrecht besteht nicht bei Verträgen:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist
            </li>
            <li>
              zur Lieferung von Waren, die schnell verderben können oder deren Verfallsdatum schnell überschritten würde
            </li>
            <li>
              zur Lieferung versiegelter Waren, die aus Gründen des Gesundheitsschutzes oder der Hygiene nicht zur Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde
            </li>
            <li>
              zur Lieferung von Waren, die nach der Lieferung aufgrund ihrer Beschaffenheit untrennbar mit anderen Gütern vermischt wurden
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Muster-Widerrufsformular</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p>
            Ein Muster-Widerrufsformular wird den Verbrauchern vom jeweiligen gewerblichen Verkäufer zur Verfügung gestellt oder kann direkt beim Verkäufer angefordert werden.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}