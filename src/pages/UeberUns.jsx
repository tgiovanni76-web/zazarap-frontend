import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UeberUns() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Über uns</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Unsere Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Zazarap.de verbindet Menschen für sicheren und fairen Handel – einfach, schnell und transparent.</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Was wir bieten</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 space-y-1">
            <li>Benutzerfreundliche Inserate</li>
            <li>Tools für Vertrauen & Sicherheit</li>
            <li>Unterstützung durch unseren Support</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontakt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p>WOHLGER GbR</p>
          <p>Kronenstr. 10</p>
          <p>75245 Neulingen, Deutschland</p>
          <p>Gesellschafter: Giovanni Tornabene, Marco Ruggieri</p>
          <p>E-Mail: <a href="mailto:info@zazarap.de" className="text-[var(--z-accent)] hover:text-[#E6BD00]">info@zazarap.de</a></p>
        </CardContent>
      </Card>
    </div>
  );
}