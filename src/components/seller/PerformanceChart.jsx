import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function PerformanceChart({ data, title = 'Performance vendite (ultimi 6 mesi)' }) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month"/>
              <YAxis/>
              <Tooltip/>
              <Line type="monotone" dataKey="revenue" name="Ricavi" stroke="#6366f1" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="orders" name="Ordini" stroke="#10b981" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}