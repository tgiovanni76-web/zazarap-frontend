import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLanguage } from '../LanguageProvider';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const CANON = {
  veicoli: ['veicoli','vehicles','vehicle','auto','cars','car'],
  sport: ['sport','sports'],
  servizi: ['servizi','services','service'],
  elettronica: ['elettronica','electronics','electronic'],
  animali: ['animali','animals','pets'],
  arredamento: ['arredamento','furniture'],
  abbigliamento: ['abbigliamento','clothing','clothes','fashion'],
  libri: ['libri','books','book'],
  altro: ['altro','other','others']
};

const normalizeCategory = (raw) => {
  const s = (raw || 'altro').toString().trim().toLowerCase();
  for (const [key, vals] of Object.entries(CANON)) {
    if (s === key || vals.includes(s)) return key;
  }
  return 'altro';
};

const getCategoryLabel = (category) => category.charAt(0).toUpperCase() + category.slice(1);

export default function CategoryBreakdown({ listings }) {
  const { t } = useLanguage();
  const chartData = React.useMemo(() => {
    const counts = {};
    listings.forEach(listing => {
      const key = normalizeCategory(listing.category);
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([key, count]) => ({
      key,
      name: t(`category.${key}`) || getCategoryLabel(key),
      value: count
    }));
  }, [listings, t]);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{t('dashboard.listingsByCategory') || 'Listings by Category'}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}