import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Support() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Support</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Wie können wir helfen?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <Link to={createPageUrl('FAQ')} className="text-[var(--z-accent)] hover:text-[#E6BD00]">FAQ ansehen</Link>
            </li>
            <li>
              <Link to={createPageUrl('Contact')} className="text-[var(--z-accent)] hover:text-[#E6BD00]">Kontaktformular</Link>
            </li>
            <li>E-Mail: <a href="mailto:info@zazarap.de" className="text-[var(--z-accent)] hover:text-[#E6BD00]">info@zazarap.de</a></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}