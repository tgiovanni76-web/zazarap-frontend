import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingBag, Plus } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Marketplace')} className="flex items-center gap-2">
              <div className="text-2xl font-bold text-indigo-600">Zazarap</div>
            </Link>

            <div className="flex items-center gap-2">
              <Link to={createPageUrl('Marketplace')}>
                <Button 
                  variant={currentPageName === 'Marketplace' ? 'default' : 'ghost'}
                  className="gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Marketplace
                </Button>
              </Link>

              <Link to={createPageUrl('NewListing')}>
                <Button 
                  variant={currentPageName === 'NewListing' ? 'default' : 'ghost'}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nuovo annuncio
                </Button>
              </Link>

              <Link to={createPageUrl('MarketplaceDashboard')}>
                <Button 
                  variant={currentPageName === 'MarketplaceDashboard' ? 'default' : 'ghost'}
                  className="gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}