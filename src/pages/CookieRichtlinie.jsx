import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookieRichtlinie() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Cookie-Richtlinie</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Was sind Cookies?</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, um Funktionen bereitzustellen und die Nutzung zu analysieren.</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Welche Cookies wir einsetzen</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 space-y-1">
            <li>Essentielle Cookies (erforderlich für Grundfunktionen)</li>
            <li>Analyse-Cookies (nur mit Einwilligung)</li>
            <li>Marketing-Cookies (nur mit Einwilligung)</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Cookie-Verwaltung</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sie können Cookies in den Browsereinstellungen löschen oder blockieren. Nicht-essentielle Cookies setzen wir erst nach Ihrer Zustimmung.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stand</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aktualisiert am {new Date().toLocaleDateString('de-DE')}.</p>
        </CardContent>
      </Card>
    </div>
  );
}