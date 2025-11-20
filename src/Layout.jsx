import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingBag, Plus } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        .zaza-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          padding: 10px;
        }

        @media (min-width: 680px) {
          .zaza-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .zaza-card {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0px 2px 6px rgba(0,0,0,0.15);
          position: relative;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .zaza-card:hover {
          transform: translateY(-3px);
          box-shadow: 0px 4px 12px rgba(0,0,0,0.25);
        }

        .zaza-img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          background: #eee;
        }

        .zaza-heart {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255,255,255,0.9);
          border-radius: 50%;
          padding: 6px;
          font-size: 18px;
          cursor: pointer;
          user-select: none;
          z-index: 10;
        }

        .zaza-heart.active {
          color: #e84c00;
        }

        .zaza-title {
          font-size: 14px;
          font-weight: bold;
          margin: 6px;
          line-height: 1.2em;
        }

        .zaza-price {
          font-size: 16px;
          font-weight: bold;
          color: #e84c00;
          margin: 0 6px;
        }

        .zaza-location {
          font-size: 12px;
          color: #555;
          margin: 0 6px 6px 6px;
        }

        .zaza-category {
          display: inline-block;
          background: #ff7a00;
          color: white;
          padding: 2px 8px;
          font-size: 11px;
          border-radius: 6px;
          margin: 4px 6px;
        }

        @media (prefers-color-scheme: dark) {
          .zaza-card {
            background: #222;
            box-shadow: 0px 2px 6px rgba(0,0,0,0.4);
          }
          .zaza-title {
            color: #fff;
          }
          .zaza-price {
            color: #ff9a4d;
          }
          .zaza-location {
            color: #ddd;
          }
          .zaza-category {
            background: #ff9a4d;
          }
          .zaza-heart {
            background: rgba(50,50,50,0.9);
            color: #fff;
          }
        }
      `}</style>
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