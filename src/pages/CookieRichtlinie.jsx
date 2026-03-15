import React from "react";
import { useLanguage } from '@/components/LanguageProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookieRichtlinie() {
  const { t } = useLanguage();
  const tr = (k, fb) => { const v = t(k); return v === k ? fb : v; };
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">{tr('cookies.title','Cookie-Richtlinie')}</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{tr('cookies.what','Was sind Cookies?')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{tr('cookies.what.p','Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, um Funktionen bereitzustellen und die Nutzung zu analysieren.')}</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{tr('cookies.which','Welche Cookies wir einsetzen')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 space-y-1">
            <li>{tr('cookies.which.essential','Essentielle Cookies (erforderlich für Grundfunktionen)')}</li>
            <li>{tr('cookies.which.analytics','Analyse-Cookies (nur mit Einwilligung)')}</li>
            <li>{tr('cookies.which.marketing','Marketing-Cookies (nur mit Einwilligung)')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{tr('cookies.management','Cookie-Verwaltung')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{tr('cookies.management.p','Sie können Cookies in den Browsereinstellungen löschen oder blockieren. Nicht-essentielle Cookies setzen wir erst nach Ihrer Zustimmung.')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tr('cookies.status','Stand')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aktualisiert am {new Date().toLocaleDateString('de-DE')}.</p>
        </CardContent>
      </Card>
    </div>
  );
}