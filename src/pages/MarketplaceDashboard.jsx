import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Package, TrendingUp, DollarSign, MapPin } from 'lucide-react';
import StatCard from '../components/marketplace/StatCard';
import ListingsChart from '../components/marketplace/ListingsChart';
import CategoryBreakdown from '../components/marketplace/CategoryBreakdown';
import RecentListings from '../components/marketplace/RecentListings';
import DashboardFilters from '../components/marketplace/DashboardFilters';

export default function MarketplaceDashboard() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list('-created_date'),
  });

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const statusMatch = statusFilter === 'all' || listing.status === statusFilter;
      const categoryMatch = categoryFilter === 'all' || listing.category === categoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [listings, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const active = filteredListings.filter(l => l.status === 'active').length;
    const sold = filteredListings.filter(l => l.status === 'sold').length;
    const totalRevenue = filteredListings
      .filter(l => l.status === 'sold')
      .reduce((sum, l) => sum + (l.price || 0), 0);
    const uniqueCities = [...new Set(filteredListings.map(l => l.city).filter(Boolean))].length;

    return {
      active,
      sold,
      totalRevenue,
      uniqueCities
    };
  }, [filteredListings]);

  const handleExport = () => {
    const csvContent = [
      ['Title', 'Price', 'Category', 'Status', 'Views', 'Inquiries', 'Created Date'].join(','),
      ...filteredListings.map(listing => [
        `"${listing.title}"`,
        listing.price,
        listing.category,
        listing.status,
        listing.views || 0,
        listing.inquiries || 0,
        new Date(listing.created_date).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketplace-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Zazarap Dashboard</h1>
          <p className="text-slate-600">Monitor your marketplace performance and listings</p>
        </div>

        {/* Filters */}
        <DashboardFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          onExport={handleExport}
          onReset={handleReset}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Listings"
            value={stats.active}
            icon={Package}
            color="bg-blue-500"
            index={0}
          />
          <StatCard
            title="Sold Items"
            value={stats.sold}
            icon={TrendingUp}
            color="bg-green-500"
            index={1}
          />
          <StatCard
            title="Total Revenue"
            value={`€${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="bg-purple-500"
            index={2}
          />
          <StatCard
            title="Cities"
            value={stats.uniqueCities}
            icon={MapPin}
            color="bg-orange-500"
            index={3}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ListingsChart listings={filteredListings} />
          <CategoryBreakdown listings={filteredListings} />
        </div>

        {/* Recent Listings */}
        <RecentListings listings={filteredListings} />
      </div>
    </div>
  );
}