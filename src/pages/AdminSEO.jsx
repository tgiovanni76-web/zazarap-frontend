import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Save, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProvider';
import SEOHead from '../components/SEOHead';

export default function AdminSEO() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    googleSiteVerification: '',
    bingSiteVerification: '',
    robotsTxtContent: ''
  });
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [robotsUrl, setRobotsUrl] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: existingSettings, isLoading } = useQuery({
    queryKey: ['seoSettings'],
    queryFn: async () => {
      const res = await base44.entities.SEOSettings.list();
      return res[0] || null;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (existingSettings) {
      setSettings({
        googleSiteVerification: existingSettings.googleSiteVerification || '',
        bingSiteVerification: existingSettings.bingSiteVerification || '',
        robotsTxtContent: existingSettings.robotsTxtContent || ''
      });
    }
  }, [existingSettings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Assuming functions are served at the same origin
      const baseUrl = window.location.origin;
      // Adjust paths based on actual function serving logic
      setSitemapUrl(`${baseUrl}/api/functions/invoke/generateSitemap`); 
      setRobotsUrl(`${baseUrl}/api/functions/invoke/robots`);
    }
  }, []);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingSettings) {
        return base44.entities.SEOSettings.update(existingSettings.id, data);
      } else {
        return base44.entities.SEOSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seoSettings'] });
      toast.success('Impostazioni SEO salvate con successo');
    },
    onError: () => {
      toast.error('Errore nel salvataggio');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiato negli appunti');
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-8 text-center">Accesso negato</div>;
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <SEOHead title="Admin SEO & Sitemap | Zazarap" />
      <h1 className="text-3xl font-bold mb-8">Gestione SEO e Sitemap</h1>

      <div className="grid gap-6">
        {/* GSC Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Google Search Console
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Codice di Verifica (HTML Tag)</label>
              <p className="text-sm text-slate-500 mb-2">
                Inserisci il codice <code>content</code> del meta tag di verifica.
                Es: <code>w-5...</code> da <code>&lt;meta name="google-site-verification" content="..." /&gt;</code>
              </p>
              <div className="flex gap-2">
                <Input 
                  value={settings.googleSiteVerification}
                  onChange={(e) => setSettings({...settings, googleSiteVerification: e.target.value})}
                  placeholder="Incolla qui il codice di verifica"
                />
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                Come verificare:
              </h4>
              <ol className="list-decimal list-inside text-sm space-y-1">
                <li>Vai su <a href="https://search.google.com/search-console" target="_blank" className="text-blue-600 hover:underline">Google Search Console</a></li>
                <li>Aggiungi la proprietà (URL prefix: <code>{typeof window !== 'undefined' ? window.location.origin : ''}</code>)</li>
                <li>Scegli metodo "HTML tag"</li>
                <li>Copia il codice e incollalo qui sopra</li>
                <li>Salva in questa pagina</li>
                <li>Torna su GSC e clicca "Verifica"</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Sitemap & Robots */}
        <Card>
          <CardHeader>
            <CardTitle>Sitemap & Robots.txt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block font-medium mb-1">Sitemap XML URL</label>
              <div className="flex gap-2">
                <Input value={sitemapUrl} readOnly className="bg-slate-50" />
                <Button variant="outline" onClick={() => copyToClipboard(sitemapUrl)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <a href={sitemapUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
              <p className="text-xs text-slate-500 mt-1">Invia questo URL su Google Search Console sotto "Sitemaps"</p>
            </div>

            <div>
              <label className="block font-medium mb-1">Robots.txt URL</label>
              <div className="flex gap-2">
                <Input value={robotsUrl} readOnly className="bg-slate-50" />
                <Button variant="outline" onClick={() => copyToClipboard(robotsUrl)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <a href={robotsUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" className="bg-green-600 hover:bg-green-700">
            <Save className="w-5 h-5 mr-2" />
            Salva Impostazioni
          </Button>
        </div>
      </div>
    </div>
  );
}