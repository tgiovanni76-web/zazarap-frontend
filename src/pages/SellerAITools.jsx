import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Wand2, Camera, TrendingUp, Sparkles, FileText, 
  BarChart3, Lightbulb, Target, ArrowRight, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import AdvancedDescriptionAssistant from '../components/seller/AdvancedDescriptionAssistant';
import AdvancedImageAnalyzer from '../components/seller/AdvancedImageAnalyzer';
import MarketDemandPredictor from '../components/seller/MarketDemandPredictor';
import { useLanguage } from '../components/LanguageProvider';

export default function SellerAITools() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('description');
  const [testProduct, setTestProduct] = useState({
    title: '',
    category: '',
    condition: 'gebraucht',
    price: '',
    city: ''
  });
  const [testImages, setTestImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('order'),
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    if (files.length > 0) {
      setTestImages(files);
      const previews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === files.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const tools = [
    {
      id: 'description',
      title: t('aiTools.descriptionAssistant.title'),
      description: t('aiTools.descriptionAssistant.desc'),
      icon: Wand2,
      color: 'from-purple-600 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      id: 'images',
      title: t('aiTools.imageAnalyzer.title'),
      description: t('aiTools.imageAnalyzer.desc'),
      icon: Camera,
      color: 'from-cyan-600 to-blue-600',
      bgColor: 'from-cyan-50 to-blue-50'
    },
    {
      id: 'demand',
      title: t('aiTools.demandPredictor.title'),
      description: t('aiTools.demandPredictor.desc'),
      icon: TrendingUp,
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'from-emerald-50 to-teal-50'
    }
  ];

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">{t('aiTools.pageTitle')}</h1>
        </div>
        <p className="text-slate-600">
          {t('aiTools.pageDesc')}
        </p>
      </div>

      {/* Tool cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {tools.map((tool) => (
          <Card 
            key={tool.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeTab === tool.id ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setActiveTab(tool.id)}
          >
            <CardContent className="pt-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}>
                <tool.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold mb-1">{tool.title}</h3>
              <p className="text-sm text-slate-500">{tool.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test product input */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">{t('aiTools.testProduct')}</CardTitle>
          <CardDescription>
            {t('aiTools.testProductDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('title')}</label>
              <Input
                placeholder="iPhone 13 Pro 128GB"
                value={testProduct.title}
                onChange={(e) => setTestProduct({...testProduct, title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('category')}</label>
              <Select 
                value={testProduct.category} 
                onValueChange={(v) => setTestProduct({...testProduct, category: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.active).map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {t(cat.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('price')} (€)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={testProduct.price}
                onChange={(e) => setTestProduct({...testProduct, price: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('city')}</label>
              <Input
                placeholder="München"
                value={testProduct.city}
                onChange={(e) => setTestProduct({...testProduct, city: e.target.value})}
              />
            </div>
          </div>

          {/* Image upload */}
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">{t('images')} (max 4)</label>
            <div className="flex items-center gap-4">
              <label className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                <span className="text-sm text-slate-500">
                  {t('aiTools.clickToUpload')}
                </span>
              </label>
              {imagePreviews.length > 0 && (
                <div className="flex gap-2">
                  {imagePreviews.map((preview, idx) => (
                    <img 
                      key={idx}
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active tool */}
      <div className="space-y-6">
        {activeTab === 'description' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-bold">{t('aiTools.descriptionAssistant.title')}</h2>
            </div>
            <AdvancedDescriptionAssistant
              title={testProduct.title}
              category={testProduct.category}
              condition={testProduct.condition}
              price={testProduct.price}
              images={imagePreviews}
              onDescriptionSelect={(desc) => toast.success(t('aiDesc.generated'))}
              onSeoSelect={(seo) => toast.success(t('aiDesc.applySeo'))}
            />
          </div>
        )}

        {activeTab === 'images' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-cyan-600" />
              <h2 className="text-xl font-bold">{t('aiTools.imageAnalyzer.title')}</h2>
            </div>
            {imagePreviews.length > 0 ? (
              <AdvancedImageAnalyzer
                images={imagePreviews}
                category={testProduct.category}
              />
            ) : (
              <Card className="border-2 border-dashed border-slate-300">
                <CardContent className="py-12 text-center">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">
                    {t('aiImg.uploadFirst')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'demand' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-bold">{t('aiTools.demandPredictor.title')}</h2>
            </div>
            <MarketDemandPredictor
              productTitle={testProduct.title}
              category={testProduct.category}
              currentPrice={testProduct.price}
              condition={testProduct.condition}
              location={testProduct.city}
              onPriceSelect={(price) => {
                setTestProduct({...testProduct, price: price.toString()});
                toast.success(`${t('price')}: ${price}€`);
              }}
            />
          </div>
        )}
      </div>

      {/* Tips section */}
      <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold mb-2">{t('aiTools.tips.title')}</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• {t('aiDesc.useDescription')}</li>
                <li>• {t('aiImg.title')}</li>
                <li>• {t('aiDemand.optimalPrice')}</li>
                <li>• {t('aiDemand.bestTime')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}