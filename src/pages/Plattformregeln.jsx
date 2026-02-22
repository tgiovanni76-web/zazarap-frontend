import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Plattformregeln() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Plattformregeln</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Zulässige Inhalte</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Nur rechtlich zulässige Waren und Dienstleistungen dürfen eingestellt werden.</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Verbotene Inhalte</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 space-y-1">
            <li>Illegale Produkte oder Dienstleistungen</li>
            <li>Hassrede, Gewaltverherrlichung, Pornografie</li>
            <li>Urheberrechtsverletzende Inhalte</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Verhalten</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Respektvoller Umgang ist Pflicht. Spam, Betrug oder Belästigung sind untersagt.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Durchsetzung</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Bei Verstößen können Inhalte entfernt und Konten gesperrt werden.</p>
        </CardContent>
      </Card>
    </div>
  );
}