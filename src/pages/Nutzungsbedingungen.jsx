import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Nutzungsbedingungen() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Nutzungsbedingungen</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Geltungsbereich</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Diese Bedingungen regeln die Nutzung der Plattform Zazarap.de zwischen der Zazarap GmbH und den Nutzerinnen und Nutzern.</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Registrierung & Konto</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sie verpflichten sich, wahrheitsgemäße Angaben zu machen und Zugangsdaten vertraulich zu behandeln. Konten dürfen nicht übertragen werden.</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Verhalten & Inhalte</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Es sind nur rechtlich zulässige Inhalte erlaubt. Rechtsverletzende, beleidigende oder irreführende Inhalte sind untersagt.</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Haftung</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Wir haften nur für Vorsatz und grobe Fahrlässigkeit; im Übrigen nach den gesetzlichen Vorschriften.</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Kündigung</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Wir können Konten bei Verstößen sperren oder kündigen. Nutzer können ihr Konto jederzeit löschen.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schlussbestimmungen</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Es gilt deutsches Recht. Gerichtsstand ist, soweit zulässig, der Sitz der Zazarap GmbH.</p>
        </CardContent>
      </Card>
    </div>
  );
}