import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Termini e Condizioni d'Uso</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. Accettazione dei Termini</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p>
            Utilizzando Zazarap, accetti integralmente questi Termini e Condizioni. 
            Se non accetti, non utilizzare la piattaforma.
          </p>
          <p>
            <strong>Requisiti:</strong> Devi avere almeno 18 anni o maggiorenne nel tuo paese.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>2. Uso della Piattaforma</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p><strong>È VIETATO:</strong></p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Vendere prodotti illegali, contraffatti o rubati</li>
            <li>Truffare, ingannare o danneggiare altri utenti</li>
            <li>Pubblicare contenuti offensivi, diffamatori o inappropriati</li>
            <li>Manipolare recensioni o valutazioni</li>
            <li>Creare account multipli per scopi fraudolenti</li>
            <li>Violare diritti di proprietà intellettuale</li>
          </ul>
          <p className="mt-4">
            <strong>Conseguenze:</strong> Sospensione o ban permanente, trattenimento fondi, segnalazione alle autorità.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3. Venditori</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p><strong>Responsabilità:</strong></p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Descrizioni accurate e foto reali dei prodotti</li>
            <li>Rispettare le leggi fiscali (dichiarazione redditi)</li>
            <li>Spedire entro 3 giorni lavorativi dal pagamento</li>
            <li>Fornire numero tracking per spedizioni</li>
            <li>Imballaggio adeguato per evitare danni</li>
          </ul>
          <p><strong>Commissioni:</strong> Zazarap trattiene il 5% su ogni vendita (+ commissioni PayPal se applicabili).</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>4. Acquirenti</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p><strong>Responsabilità:</strong></p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Pagare l'importo concordato</li>
            <li>Fornire indirizzo di spedizione corretto</li>
            <li>Confermare ricezione entro 3 giorni dalla consegna</li>
            <li>Aprire dispute solo per problemi legittimi</li>
          </ul>
          <p><strong>Protezione Acquirente:</strong> Sistema escrow protegge i tuoi fondi fino alla conferma di ricezione.</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>5. Pagamenti e Escrow</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p><strong>Sistema Escrow:</strong></p>
          <ul className="list-disc pl-6 space-y-2">
            <li>I fondi PayPal vengono trattenuti fino alla consegna</li>
            <li>Rilascio automatico dopo 14 giorni o conferma acquirente</li>
            <li>In caso di dispute, fondi congelati fino a risoluzione</li>
          </ul>
          <p><strong>Rimborsi:</strong> Disponibili solo per problemi verificati (prodotto non ricevuto, non conforme).</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>6. Dispute e Reclami</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p>In caso di problemi:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Contatta prima l'altra parte via chat</li>
            <li>Se non risolto, apri una dispute entro 7 giorni</li>
            <li>Fornisci prove (foto, messaggi, tracking)</li>
            <li>Il team Zazarap esaminerà entro 48 ore</li>
            <li>Decisione finale vincolante</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>7. Limitazione Responsabilità</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p>Zazarap è una piattaforma che mette in contatto venditori e acquirenti. NON siamo responsabili per:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Qualità, sicurezza o legalità dei prodotti venduti</li>
            <li>Contenuti pubblicati dagli utenti</li>
            <li>Azioni o omissioni di venditori/acquirenti</li>
            <li>Danni durante la spedizione (responsabilità del corriere)</li>
            <li>Perdite finanziarie derivanti da transazioni</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>8. Proprietà Intellettuale</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p>
            Tutti i contenuti della piattaforma (logo, design, testi) sono proprietà di Zazarap. 
            È vietato copiarli senza autorizzazione.
          </p>
          <p>
            Pubblicando contenuti, ci concedi licenza d'uso non esclusiva per visualizzarli sulla piattaforma.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Modifiche e Terminazione</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p>
            Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. 
            Le modifiche saranno comunicate e pubblicate.
          </p>
          <p>
            Possiamo sospendere o terminare account che violano questi Termini, senza preavviso.
          </p>
          <p className="mt-4"><strong>Ultimo aggiornamento:</strong> 21 Novembre 2024</p>
        </CardContent>
      </Card>
    </div>
  );
}