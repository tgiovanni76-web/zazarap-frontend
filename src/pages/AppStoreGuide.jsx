import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Download, 
  Smartphone, 
  Apple, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Code,
  Package,
  Upload,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../components/LanguageProvider';

export default function AppStoreGuide() {
  const { t } = useLanguage();
  const tr = (k, fb) => { const v = t(k); return v === k ? fb : v; };
  const [completedSteps, setCompletedSteps] = useState({});

  const toggleStep = (stepId) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const prerequisites = [
    {
      id: 'builder-plan',
      title: 'Piano Builder Base44',
      description: 'Necessario per esportare il codice sorgente',
      cost: 'Variabile',
      required: true
    },
    {
      id: 'apple-dev',
      title: 'Apple Developer Account',
      description: 'Per pubblicare su App Store',
      cost: '$99/anno',
      required: true,
      link: 'https://developer.apple.com/programs/'
    },
    {
      id: 'google-dev',
      title: 'Google Play Console Account',
      description: 'Per pubblicare su Play Store',
      cost: '$25 una tantum',
      required: true,
      link: 'https://play.google.com/console/signup'
    },
    {
      id: 'mac',
      title: 'Computer Mac',
      description: 'Necessario per build iOS (o servizio cloud)',
      cost: 'Hardware o $30/mese servizio cloud',
      required: false
    }
  ];

  const steps = [
    {
      id: 'export',
      title: 'Step 1: Esporta il Codice',
      icon: Download,
      substeps: [
        {
          id: 'export-1',
          text: 'Upgrade al piano Builder su Base44',
          link: 'https://base44.com/pricing'
        },
        {
          id: 'export-2',
          text: 'Clicca il pulsante "Export" nell\'editor'
        },
        {
          id: 'export-3',
          text: 'Scegli GitHub export o ZIP download'
        },
        {
          id: 'export-4',
          text: 'Salva il codice localmente o su GitHub'
        }
      ]
    },
    {
      id: 'capacitor',
      title: 'Step 2: Setup Capacitor',
      icon: Code,
      substeps: [
        {
          id: 'cap-1',
          text: 'Installa Node.js (se non presente)',
          link: 'https://nodejs.org/'
        },
        {
          id: 'cap-2',
          text: 'Apri il terminale nella cartella del progetto'
        },
        {
          id: 'cap-3',
          text: 'Esegui: npm install @capacitor/core @capacitor/cli'
        },
        {
          id: 'cap-4',
          text: 'Esegui: npx cap init'
        },
        {
          id: 'cap-5',
          text: 'Configura appName: "Zazarap" e appId: "com.zazarap.app"'
        }
      ]
    },
    {
      id: 'ios-setup',
      title: 'Step 3: Build iOS',
      icon: Apple,
      substeps: [
        {
          id: 'ios-1',
          text: 'Installa Xcode dall\'App Store (solo su Mac)',
          link: 'https://apps.apple.com/app/xcode/id497799835'
        },
        {
          id: 'ios-2',
          text: 'Esegui: npm install @capacitor/ios'
        },
        {
          id: 'ios-3',
          text: 'Esegui: npx cap add ios'
        },
        {
          id: 'ios-4',
          text: 'Esegui: npx cap sync'
        },
        {
          id: 'ios-5',
          text: 'Apri il progetto Xcode: npx cap open ios'
        },
        {
          id: 'ios-6',
          text: 'Configura Bundle ID, certificati e provisioning profiles'
        },
        {
          id: 'ios-7',
          text: 'Build e upload su App Store Connect'
        }
      ]
    },
    {
      id: 'android-setup',
      title: 'Step 4: Build Android',
      icon: Smartphone,
      substeps: [
        {
          id: 'android-1',
          text: 'Installa Android Studio',
          link: 'https://developer.android.com/studio'
        },
        {
          id: 'android-2',
          text: 'Esegui: npm install @capacitor/android'
        },
        {
          id: 'android-3',
          text: 'Esegui: npx cap add android'
        },
        {
          id: 'android-4',
          text: 'Esegui: npx cap sync'
        },
        {
          id: 'android-5',
          text: 'Apri Android Studio: npx cap open android'
        },
        {
          id: 'android-6',
          text: 'Configura applicationId in build.gradle'
        },
        {
          id: 'android-7',
          text: 'Genera keystore per firma: keytool -genkey -v -keystore zazarap.keystore'
        },
        {
          id: 'android-8',
          text: 'Build → Generate Signed Bundle/APK'
        }
      ]
    },
    {
      id: 'assets',
      title: 'Step 5: Prepara Asset',
      icon: Package,
      substeps: [
        {
          id: 'assets-1',
          text: 'Logo app 1024x1024px (PNG con trasparenza per iOS)'
        },
        {
          id: 'assets-2',
          text: 'Screenshot per tutti i device (iPhone, iPad, Android)'
        },
        {
          id: 'assets-3',
          text: 'Descrizione app in tutte le lingue supportate'
        },
        {
          id: 'assets-4',
          text: 'Privacy Policy URL (già disponibile su Zazarap)'
        },
        {
          id: 'assets-5',
          text: 'Termini e Condizioni URL (già disponibile)'
        }
      ]
    },
    {
      id: 'submission',
      title: 'Step 6: Submit agli Store',
      icon: Upload,
      substeps: [
        {
          id: 'submit-1',
          text: 'App Store: Crea app su App Store Connect',
          link: 'https://appstoreconnect.apple.com/'
        },
        {
          id: 'submit-2',
          text: 'Carica build da Xcode → Archive → Distribute'
        },
        {
          id: 'submit-3',
          text: 'Compila informazioni app e screenshot'
        },
        {
          id: 'submit-4',
          text: 'Submit for Review (tempo revisione: 1-3 giorni)'
        },
        {
          id: 'submit-5',
          text: 'Play Store: Crea app su Google Play Console',
          link: 'https://play.google.com/console/'
        },
        {
          id: 'submit-6',
          text: 'Carica AAB/APK generato da Android Studio'
        },
        {
          id: 'submit-7',
          text: 'Compila scheda store e screenshot'
        },
        {
          id: 'submit-8',
          text: 'Invia per revisione (tempo: alcune ore)'
        }
      ]
    }
  ];

  const totalSubsteps = steps.reduce((acc, step) => acc + step.substeps.length, 0);
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progress = totalSubsteps > 0 ? Math.round((completedCount / totalSubsteps) * 100) : 0;

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">{tr('appStoreGuide.title','Pubblicazione App Store & Play Store')}</h1>
        <p className="text-slate-600 text-lg">
          Guida completa per trasformare Zazarap in app nativa per iOS e Android
        </p>
      </div>

      {/* Progress */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold">{tr('appStoreGuide.overallProgress','Progresso Complessivo')}</span>
            <span className="text-2xl font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-600 mt-2">
            {completedCount} di {totalSubsteps} passaggi completati
          </p>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert className="mb-6 border-yellow-300 bg-yellow-50">
        <AlertCircle className="h-5 w-5 text-yellow-600" />
        <AlertDescription className="text-yellow-900">
          <strong>Importante:</strong> Base44 NON supporta ancora pubblicazione diretta. 
          Questa guida spiega come esportare il codice e usare Capacitor per creare app native.
          Processo tecnico richiesto - considera di assumere uno sviluppatore se necessario.
        </AlertDescription>
      </Alert>

      {/* Prerequisites */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Prerequisiti e Costi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prerequisites.map(prereq => (
              <div key={prereq.id} className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{prereq.title}</h3>
                    {prereq.required && (
                      <Badge variant="destructive" className="text-xs">{tr('common.required','Obbligatorio')}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{prereq.description}</p>
                  <p className="text-sm font-medium text-blue-600">{prereq.cost}</p>
                </div>
                {prereq.link && (
                  <a 
                    href={prereq.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-slate-100 rounded-lg">
            <p className="font-semibold mb-2">{tr('appStoreGuide.costEstimate','Stima Costi Totali:')}</p>
            <ul className="text-sm space-y-1">
              <li>• Piano Builder Base44: variabile</li>
              <li>• Apple Developer: $99/anno</li>
              <li>• Google Play: $25 una tantum</li>
              <li>• Totale minimo: ~$124+ primo anno</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      {steps.map((step, idx) => {
        const StepIcon = step.icon;
        const stepCompleted = step.substeps.every(sub => completedSteps[sub.id]);
        
        return (
          <Card key={step.id} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stepCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <StepIcon className={`h-6 w-6 ${stepCompleted ? 'text-green-600' : 'text-blue-600'}`} />
                </div>
                <span>{step.title}</span>
                {stepCompleted && (
                  <CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {step.substeps.map(substep => (
                  <div key={substep.id} className="flex items-start gap-3">
                    <Checkbox
                      id={substep.id}
                      checked={completedSteps[substep.id] || false}
                      onCheckedChange={() => toggleStep(substep.id)}
                      className="mt-1"
                    />
                    <label
                      htmlFor={substep.id}
                      className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                    >
                      <span className={completedSteps[substep.id] ? 'line-through text-slate-500' : ''}>
                        {substep.text}
                      </span>
                      {substep.link && (
                        <a
                          href={substep.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 ml-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Alternative: PWA */}
      <Card className="border-green-300 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">{tr('appStoreGuide.pwaAlt','Alternativa Più Semplice: PWA')}</CardTitle>
        </CardHeader>
        <CardContent className="text-green-900">
          <p className="mb-4">
            Zazarap è già una <strong>Progressive Web App</strong>. Gli utenti possono installarla 
            direttamente dal browser senza bisogno di App Store:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span><strong>iOS:</strong> Safari → Condividi → Aggiungi a Home</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span><strong>Android:</strong> Chrome → Menu → Installa app</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>Nessun costo, nessuna approvazione necessaria</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>Aggiornamenti istantanei quando pubblichi modifiche</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{tr('common.resources','Risorse Utili')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <a 
              href="https://capacitorjs.com/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              Documentazione Capacitor
            </a>
            <a 
              href="https://developer.apple.com/app-store/submissions/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              Guida Submission App Store
            </a>
            <a 
              href="https://support.google.com/googleplay/android-developer/answer/9859152" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              Guida Submission Play Store
            </a>
            <a 
              href="https://www.pwabuilder.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              PWABuilder (alternativa più semplice)
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}