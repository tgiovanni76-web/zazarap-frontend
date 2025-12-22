import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Filter } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

export default function DashboardFilters({ 
  statusFilter, 
  setStatusFilter,
  categoryFilter, 
  setCategoryFilter,
  onExport,
  on{t('resetFilters')} 
}) {
  const { t } = useLanguage();
  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {t('listingStatus')}
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="sold">{t('sold')}</SelectItem>
                <SelectItem value="expired">{t('expired')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {t('category')}
            </label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                <SelectItem value="elettronica">{t('electronics')}</SelectItem>
                <SelectItem value="casa">{t('home')}</SelectItem>
                <SelectItem value="moda">{t('fashion')}</SelectItem>
                <SelectItem value="sport">{t('sports')}</SelectItem>
                <SelectItem value="auto">{t('auto')}</SelectItem>
                <SelectItem value="animali">{t('animals')}</SelectItem>
                <SelectItem value="altro">{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={on{t('resetFilters')}} 
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('resetFilters')}
            </Button>
            <Button 
              onClick={onExport}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              <Download className="w-4 h-4" />
              {t('dashboard.exportCSV')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}