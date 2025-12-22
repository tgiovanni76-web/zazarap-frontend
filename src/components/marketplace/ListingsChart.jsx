import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';
import { useLanguage } from '../LanguageProvider';

export default function ListingsChart({ listings }) {
  const { t } = useLanguage();
  const chartData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'MMM dd'),
        active: 0,
        sold: 0
      };
    });

    listings.forEach(listing => {
      const listingDate = format(new Date(listing.created_date), 'MMM dd');
      const dayData = last7Days.find(d => d.date === listingDate);
      if (dayData) {
        if (listing.status === 'active') dayData.active++;
        else if (listing.status === 'sold') dayData.sold++;
      }
    });

    return last7Days;
  }, [listings]);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{t('dashboard.listingsActivity') || 'Listings Activity (Last 7 Days)'}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="active" fill="#3B82F6" name={t('dashboard.legend.active') || 'Active Listings'} radius={[8, 8, 0, 0]} />
            <Bar dataKey="sold" fill="#10B981" name={t('dashboard.legend.sold') || 'Sold Items'} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}