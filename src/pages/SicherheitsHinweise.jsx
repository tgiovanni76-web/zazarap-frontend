import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SicherheitsHinweise() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Sicherheits-Hinweise</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Allgemeine Tipps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 space-y-1">
            <li>Teilen Sie keine sensiblen Daten in Chats.</li>
            <li>Prüfen Sie Profile und Bewertungen.</li>
            <li>Nutzen Sie sichere Zahlungswege.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Schutz vor Betrug</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Misstrauen Sie unrealistischen Angeboten und drängendem Verhalten. Melden Sie verdächtige Aktivitäten sofort.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontakt bei Vorfällen</CardTitle>
        </CardHeader>
        <CardContent>
          <p>support@zazarap.de</p>
        </CardContent>
      </Card>
    </div>
  );
}