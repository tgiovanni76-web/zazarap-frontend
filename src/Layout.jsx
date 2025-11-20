import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingBag, Plus } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-800 py-4 shadow-md">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Marketplace')} className="text-white no-underline">
              <h1 className="text-2xl font-bold m-0">Zazarap</h1>
            </Link>

            <nav className="flex items-center gap-6">
              <Link to={createPageUrl('Marketplace')} className="text-white hover:text-slate-300 transition-colors">
                Home
              </Link>
              <Link to={createPageUrl('NewListing')} className="text-white hover:text-slate-300 transition-colors">
                Pubblica
              </Link>
              <Link to={createPageUrl('Favorites')} className="text-white hover:text-slate-300 transition-colors">
                Preferiti
              </Link>
              <Link to={createPageUrl('Messages')} className="text-white hover:text-slate-300 transition-colors">
                Messaggi
              </Link>
              <Link to={createPageUrl('MarketplaceDashboard')} className="text-white hover:text-slate-300 transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4">
        {children}
      </main>
    </div>
  );
}