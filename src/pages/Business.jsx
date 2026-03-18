import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Business() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-extrabold">Per aziende • Business</h1>
        <p className="text-muted-foreground mt-2">Promuovi il tuo brand con banner e card sponsorizzate su Zazarap.de</p>
        <Link to={createPageUrl('BusinessContact')}><Button className="mt-4">Richiedi una campagna</Button></Link>
      </header>

      <section className="grid md:grid-cols-3 gap-4 mb-10">
        <Card>
          <CardHeader><CardTitle>Vantaggi</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            • Audience locale e in crescita
            <br/>• Posizionamenti premium in Home, Categorie e Feed
            <br/>• Etichette chiare “Sponsorizzato” per massima trasparenza
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Formati iniziali</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            • Banner (Home, Categoria)
            <br/>• Card sponsorizzate nel feed (1 ogni 12)
            <br/>• Immagini statiche pulite; Video in futuro
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Modello</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            • Tariffa flat mensile per placement
            <br/>• Attivazione dopo approvazione admin
          </CardContent>
        </Card>
      </section>

      <section className="text-center">
        <Link to={createPageUrl('BusinessContact')}><Button size="lg">Compila il form di richiesta</Button></Link>
      </section>
    </div>
  );
}