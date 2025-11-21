import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export default function PreLaunchChecklist() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  if (user?.role !== 'admin') {
    return <div className="py-8 text-center">Zugriff verweigert</div>;
  }

  const checks = {
    critical: [
      {
        name: 'Backend Functions aktiviert',
        description: 'Erforderlich für PayPal-Webhooks und serverseitige Logik',
        status: 'unknown',
        action: 'Settings → Backend Functions aktivieren'
      },
      {
        name: 'PayPal Client ID konfiguriert',
        description: 'PAYPAL_CLIENT_ID Secret gesetzt',
        status: 'unknown',
        action: 'Settings → Secrets → PAYPAL_CLIENT_ID'
      },
      {
        name: 'PayPal Client Secret konfiguriert',
        description: 'PAYPAL_CLIENT_SECRET Secret gesetzt',
        status: 'unknown',
        action: 'Settings → Secrets → PAYPAL_CLIENT_SECRET'
      },
      {
        name: 'PayPal Webhook ID konfiguriert',
        description: 'PAYPAL_WEBHOOK_ID Secret gesetzt',
        status: 'unknown',
        action: 'Settings → Secrets → PAYPAL_WEBHOOK_ID'
      },
      {
        name: 'Impressum ausgefüllt',
        description: 'Rechtlich verpflichtend in Deutschland (§5 TMG)',
        status: 'warning',
        action: 'pages/Impressum.jsx → Firmendaten eintragen'
      },
      {
        name: 'SSL/HTTPS aktiv',
        description: 'Verschlüsselte Verbindung für Zahlungen',
        status: 'unknown',
        action: 'Wird von Base44 automatisch bereitgestellt'
      }
    ],
    recommended: [
      {
        name: 'Google Analytics ID',
        description: 'Nutzerverhalten und Conversions tracken',
        status: 'optional',
        action: 'Settings → Secrets → GOOGLE_ANALYTICS_ID'
      },
      {
        name: 'Custom Domain verbunden',
        description: 'Professionelle Domain statt subdomain.base44.com',
        status: 'optional',
        action: 'Settings → Domain'
      },
      {
        name: 'Email-Service konfiguriert',
        description: 'SendGrid/Mailgun für zuverlässige E-Mails',
        status: 'optional',
        action: 'Core.SendEmail funktioniert bereits, aber erwägen Sie einen dedizierten Service'
      },
      {
        name: 'Backup-Strategie',
        description: 'Regelmäßige Datenbank-Backups',
        status: 'optional',
        action: 'Base44 macht automatische Backups'
      }
    ],
    legal: [
      {
        name: 'Datenschutzerklärung',
        description: 'DSGVO-konform (Art. 13, 14 DSGVO)',
        status: 'complete',
        action: 'pages/DatenschutzDE.jsx vorhanden'
      },
      {
        name: 'AGB',
        description: 'Allgemeine Geschäftsbedingungen',
        status: 'complete',
        action: 'pages/AGB.jsx vorhanden'
      },
      {
        name: 'Widerrufsrecht',
        description: 'Widerrufsbelehrung für Verbraucher',
        status: 'complete',
        action: 'pages/Widerrufsrecht.jsx vorhanden'
      },
      {
        name: 'Cookie-Banner',
        description: 'Einwilligung für Cookies',
        status: 'complete',
        action: 'components/CookieBanner.jsx vorhanden'
      },
      {
        name: 'Link zu EU-Streitschlichtung',
        description: 'ODR-Plattform verlinkt',
        status: 'complete',
        action: 'Im Footer verlinkt'
      }
    ],
    testing: [
      {
        name: 'Test-Registrierung',
        description: 'Nutzer kann sich registrieren und anmelden',
        status: 'test',
        action: 'Manuell testen'
      },
      {
        name: 'Test-Anzeige erstellen',
        description: 'Anzeige mit Bildern veröffentlichen',
        status: 'test',
        action: 'Manuell testen'
      },
      {
        name: 'Test-Chat',
        description: 'Nachrichten zwischen Nutzern',
        status: 'test',
        action: 'Manuell testen'
      },
      {
        name: 'Test-Zahlung (Sandbox)',
        description: 'PayPal-Zahlung im Sandbox-Modus',
        status: 'test',
        action: 'PayPal Sandbox verwenden'
      },
      {
        name: 'Mobile Responsiveness',
        description: 'App auf Smartphone testen',
        status: 'test',
        action: 'Auf verschiedenen Geräten prüfen'
      }
    ],
    languages: [
      {
        name: 'Mehrsprachigkeit',
        description: 'Deutsch, Italienisch, Türkisch, Ukrainisch',
        status: 'complete',
        action: 'LanguageProvider implementiert'
      }
    ]
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'optional':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'test':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <XCircle className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      complete: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      optional: 'bg-blue-100 text-blue-800',
      test: 'bg-orange-100 text-orange-800',
      unknown: 'bg-slate-100 text-slate-800'
    };
    
    const labels = {
      complete: 'Fertig',
      warning: 'Aktion erforderlich',
      optional: 'Optional',
      test: 'Zu testen',
      unknown: 'Zu prüfen'
    };

    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  const renderChecklist = (title, items, severity = 'normal') => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {severity === 'critical' && (
            <Badge variant="destructive">Kritisch</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 border rounded">
              {getStatusIcon(item.status)}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold">{item.name}</h4>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-sm text-slate-600 mb-1">{item.description}</p>
                <p className="text-xs text-blue-600">→ {item.action}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-2">Pre-Launch Checkliste</h2>
      <p className="text-slate-600 mb-6">Überprüfen Sie alle Punkte vor dem Go-Live</p>

      <Card className="mb-6 bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">Wichtig: Kritische Punkte zuerst!</h3>
              <p className="text-sm text-red-800">
                Die unten aufgeführten kritischen Punkte MÜSSEN vor dem Launch konfiguriert werden, 
                da sonst Zahlungen nicht funktionieren und rechtliche Probleme entstehen können.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {renderChecklist('🔴 Kritische Konfiguration', checks.critical, 'critical')}
      {renderChecklist('⚖️ Rechtliche Anforderungen (Deutschland)', checks.legal)}
      {renderChecklist('🌍 Mehrsprachigkeit', checks.languages)}
      {renderChecklist('🧪 Testing & QA', checks.testing)}
      {renderChecklist('💡 Empfohlene Verbesserungen', checks.recommended)}

      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-green-900 mb-2">Nächste Schritte</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-green-800">
                <li>Gehen Sie zu Base44 Dashboard → Settings</li>
                <li>Aktivieren Sie Backend Functions</li>
                <li>Tragen Sie alle PayPal Secrets ein</li>
                <li>Füllen Sie das Impressum mit Ihren echten Firmendaten aus</li>
                <li>Führen Sie alle Tests durch</li>
                <li>Verbinden Sie Ihre Custom Domain</li>
                <li>🚀 Launch!</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}