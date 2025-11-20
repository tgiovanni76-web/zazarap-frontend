import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const CATEGORY_LABELS = {
  electronics: 'Electronics',
  furniture: 'Furniture',
  clothing: 'Clothing',
  vehicles: 'Vehicles',
  real_estate: 'Real Estate',
  services: 'Services',
  sports: 'Sports',
  books: 'Books',
  toys: 'Toys',
  other: 'Other'
};

export default function CategoryBreakdown({ listings }) {
  const chartData = React.useMemo(() => {
    const categoryCounts = {};
    
    listings.forEach(listing => {
      const category = listing.category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([category, count]) => ({
      name: CATEGORY_LABELS[category] || category,
      value: count
    }));
  }, [listings]);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Listings by Category</CardTitle>
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