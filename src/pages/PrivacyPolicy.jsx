import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. Raccolta Dati</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Raccogliamo i seguenti dati personali:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Dati di registrazione:</strong> nome, email, password criptata</li>
            <li><strong>Dati transazionali:</strong> cronologia acquisti, vendite, messaggi</li>
            <li><strong>Dati tecnici:</strong> indirizzo IP, browser, cookie</li>
            <li><strong>Dati opzionali:</strong> foto profilo, numero telefono, indirizzo</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>2. Utilizzo Dati</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>I tuoi dati vengono utilizzati per:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fornire e migliorare i servizi della piattaforma</li>
            <li>Elaborare transazioni e pagamenti</li>
            <li>Comunicazioni relative agli ordini e supporto clienti</li>
            <li>Prevenire frodi e garantire la sicurezza</li>
            <li>Analisi statistiche anonime (opzionale)</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3. Cookie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p><strong>Cookie Essenziali (necessari):</strong></p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Autenticazione e sessione utente</li>
            <li>Sicurezza e prevenzione frodi</li>
            <li>Preferenze di base</li>
          </ul>
          <p><strong>Cookie Opzionali (richiedono consenso):</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Analytics e statistiche di utilizzo</li>
            <li>Personalizzazione contenuti</li>
            <li>Marketing (se accettato)</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>4. Condivisione Dati</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>I tuoi dati NON vengono venduti a terzi. Condividiamo dati solo con:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>PayPal:</strong> per processare pagamenti (solo dati necessari)</li>
            <li><strong>Corrieri:</strong> nome e indirizzo per spedizioni</li>
            <li><strong>Autorità:</strong> se richiesto per legge</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>5. I Tuoi Diritti (GDPR)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Hai diritto a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Accesso:</strong> richiedere copia dei tuoi dati</li>
            <li><strong>Rettifica:</strong> correggere dati inesatti</li>
            <li><strong>Cancellazione:</strong> eliminare il tuo account e dati</li>
            <li><strong>Portabilità:</strong> esportare i tuoi dati</li>
            <li><strong>Opposizione:</strong> rifiutare marketing</li>
          </ul>
          <p className="mt-4">Per esercitare i tuoi diritti, contatta: <strong>privacy@zazarap.com</strong></p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>6. Sicurezza</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Implementiamo misure di sicurezza tra cui:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Crittografia SSL/TLS per tutte le comunicazioni</li>
            <li>Password criptate con algoritmi sicuri</li>
            <li>Sistema escrow per proteggere i pagamenti</li>
            <li>Backup regolari dei dati</li>
            <li>Monitoraggio anti-frode</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>7. Conservazione Dati</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Conserviamo i tuoi dati per:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account attivo:</strong> per tutta la durata dell'utilizzo</li>
            <li><strong>Transazioni:</strong> 10 anni (obbligo fiscale)</li>
            <li><strong>Log sicurezza:</strong> 12 mesi</li>
            <li><strong>Dopo cancellazione:</strong> 30 giorni (backup), poi eliminazione permanente</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Modifiche</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            Ci riserviamo il diritto di modificare questa Privacy Policy. 
            Le modifiche saranno comunicate via email e pubblicate su questa pagina.
          </p>
          <p className="mt-3"><strong>Ultimo aggiornamento:</strong> 21 Novembre 2024</p>
        </CardContent>
      </Card>
    </div>
  );
}