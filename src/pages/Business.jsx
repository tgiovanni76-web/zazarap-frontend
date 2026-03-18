import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Business() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-extrabold">Werben auf Zazarap • Für Unternehmen</h1>
        <p className="text-muted-foreground mt-2">Präsentieren Sie Ihre Marke mit Bannern und gesponserten Cards auf Zazarap.de</p>
      </header>

      <section className="grid md:grid-cols-3 gap-4 mb-10">
        <Card>
          <CardHeader><CardTitle>Vorteile</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            • Lokale Zielgruppe
            <br/>• Premium-Platzierungen (Home, Kategorien, Feed)
            <br/>• Hohe Transparenz („Gesponsert“-Kennzeichnung)
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Startformate</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            • Banner
            <br/>• Gesponserte Cards
            <br/>• Bilder/Video
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Modell</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            • Monatliche Pauschale
            <br/>• Aktivierung nach Admin-Freigabe
          </CardContent>
        </Card>
      </section>

      <section className="text-center">
        <Link to={createPageUrl('BusinessContact')}><Button size="lg">Anfrage senden</Button></Link>
        <p className="text-xs text-slate-500 mt-2">Ab 2,99 € pro Tag</p>
        <ul className="mt-2 text-sm text-muted-foreground space-y-1">
          <li>• Keine versteckten Kosten</li>
          <li>• Monatlich kündbar</li>
          <li>• DSGVO-konform</li>
        </ul>
      </section>
    </div>
  );
}