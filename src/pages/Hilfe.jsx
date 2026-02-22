import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Hilfe() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Hilfe</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Erste Schritte</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Erstellen Sie ein Konto, vervollständigen Sie Ihr Profil und starten Sie mit Ihrer ersten Anzeige.</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Weitere Ressourcen</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <Link to={createPageUrl('FAQ')} className="text-[var(--z-accent)] hover:text-[#E6BD00]">Häufige Fragen (FAQ)</Link>
            </li>
            <li>
              <Link to={createPageUrl('Support')} className="text-[var(--z-accent)] hover:text-[#E6BD00]">Support kontaktieren</Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}