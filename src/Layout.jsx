import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingBag, Plus } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
          /* ------------------- COLORI ------------------- */
          :root {
            --z-yellow: #FFD500;
            --z-red:    #E10600;
            --z-black:  #000000;
          }

          /* HEADER */
          .zaza-header {
            background: var(--z-black);
            color: var(--z-red);
            padding: 16px;
            font-size: 22px;
            font-weight: bold;
            border-bottom: 4px solid var(--z-yellow);
            text-align: center;
          }

          /* SEARCH BAR */
          .zaza-search {
            background: var(--z-yellow);
            border: 2px solid var(--z-red);
            padding: 12px;
            border-radius: 12px;
            font-size: 16px;
            margin: 12px;
          }

          /* GRID CATEGORIE */
          .zaza-cat-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
            padding: 10px;
          }

          .zaza-cat-card {
            background: var(--z-yellow);
            color: var(--z-black);
            border-radius: 14px;
            padding: 14px;
            text-align: center;
            font-weight: bold;
            border: 2px solid var(--z-red);
          }

          /* CARD ANNUNCI */
          .zaza-card {
            background: #0E0E0E;
            border-radius: 12px;
            overflow: hidden;
            padding-bottom: 10px;
            box-shadow: 0px 2px 6px rgba(255,213,0,0.3);
            position: relative;
          }

          .zaza-card-title {
            color: var(--z-yellow);
            font-weight: bold;
            margin: 8px;
          }

          .zaza-card-price {
            color: var(--z-red);
            font-size: 18px;
            font-weight: bold;
            margin: 0 8px;
          }

          /* PULSANTE PUBBLICA */
          .zaza-btn-pubblica {
            background: var(--z-red);
            color: white;
            padding: 15px;
            margin: 14px;
            border-radius: 14px;
            text-align: center;
            border: 3px solid var(--z-yellow);
            font-size: 18px;
            font-weight: bold;
          }

          /* FOOTER */
          .zaza-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--z-black);
            display: flex;
            justify-content: space-around;
            padding: 10px 0;
          }

          .zaza-footer-item {
            color: var(--z-yellow);
            text-align: center;
          }

          .zaza-footer-active {
            color: var(--z-red);
            font-weight: bold;
          }

          /* Legacy styles maintained for compatibility */
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

          .zaza-img {
            width: 100%;
            height: 150px;
            object-fit: cover;
            background: #0E0E0E;
          }

          .zaza-heart {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,213,0,0.9);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: var(--z-red);
            cursor: pointer;
            z-index: 10;
          }

          .zaza-heart.active,
          .zaza-heart-active {
            color: var(--z-red);
            transform: scale(1.3);
          }

          .zaza-title {
            font-size: 14px;
            font-weight: bold;
            margin: 6px;
            line-height: 1.2em;
            color: var(--z-yellow);
          }

          .zaza-price {
            font-size: 16px;
            font-weight: bold;
            color: var(--z-red);
            margin: 0 6px;
          }

          .zaza-location {
            font-size: 12px;
            color: var(--z-yellow);
            margin: 0 6px 6px 6px;
          }

          .zaza-category {
            display: inline-block;
            background: var(--z-red);
            color: var(--z-yellow);
            padding: 2px 8px;
            font-size: 11px;
            border-radius: 6px;
            margin: 4px 6px;
            border: 1px solid var(--z-yellow);
          }

          .zaza-detail-img {
            width: 100%;
            height: 250px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 15px;
            border: 3px solid var(--z-yellow);
          }

          .zaza-detail-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 6px;
          }

          .zaza-detail-price {
            font-size: 22px;
            color: var(--z-red);
            font-weight: bold;
            margin-bottom: 10px;
          }

          .zaza-detail-location {
            font-size: 13px;
            color: #666;
            margin-bottom: 10px;
          }

          .zaza-detail-category {
            display: inline-block;
            background: var(--z-red);
            color: var(--z-yellow);
            padding: 4px 10px;
            font-size: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
            border: 2px solid var(--z-yellow);
          }

          .zaza-detail-description {
            font-size: 15px;
            line-height: 1.4em;
            margin-bottom: 25px;
          }

          .zaza-contact-btn {
            background-color: var(--z-red);
            color: white;
            padding: 14px;
            font-size: 16px;
            text-align: center;
            border-radius: 8px;
            font-weight: bold;
            border: 3px solid var(--z-yellow);
            cursor: pointer;
            width: 100%;
          }

          .zaza-form-label {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 14px;
            display: block;
          }

          .zaza-input {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            border: 2px solid var(--z-yellow);
            margin-bottom: 15px;
          }

          .zaza-upload {
            border: 2px dashed var(--z-red);
            color: var(--z-red);
            background: var(--z-yellow);
            padding: 20px;
            text-align: center;
            border-radius: 12px;
            margin-bottom: 20px;
            cursor: pointer;
            font-weight: bold;
          }

          .zaza-submit {
            background: var(--z-red);
            color: white;
            padding: 14px;
            font-size: 16px;
            border-radius: 10px;
            text-align: center;
            font-weight: bold;
            border: 3px solid var(--z-yellow);
            cursor: pointer;
            width: 100%;
          }

          .zaza-profile-pic {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            margin: 20px auto;
            display: block;
            border: 3px solid var(--z-yellow);
          }

          .zaza-profile-name {
            font-size: 20px;
            text-align: center;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .zaza-profile-count {
            font-size: 14px;
            text-align: center;
            color: #666;
            margin-bottom: 20px;
          }

          .zaza-profile-btn {
            background: var(--z-red);
            color: white;
            padding: 12px;
            border-radius: 10px;
            margin: 10px 0;
            text-align: center;
            font-weight: bold;
            display: block;
            text-decoration: none;
            border: 2px solid var(--z-yellow);
            cursor: pointer;
            width: 100%;
          }

          .zaza-filters {
            background: var(--z-yellow);
            padding: 12px;
            border-radius: 12px;
            box-shadow: 0px 2px 8px rgba(0,0,0,0.12);
            margin-bottom: 18px;
            border: 2px solid var(--z-red);
          }

          .zaza-filters-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--z-black);
          }

          .zaza-filters-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .zaza-filter-input,
          .zaza-filter-select {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            border: 2px solid var(--z-red);
            font-size: 14px;
          }

          .zaza-filter-btn {
            margin-top: 14px;
            width: 100%;
            background: var(--z-red);
            color: white;
            padding: 12px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            border: 2px solid var(--z-black);
            cursor: pointer;
          }

          .zaza-filters-bar {
            display: flex;
            overflow-x: auto;
            gap: 10px;
            padding: 10px;
          }

          .zaza-filter-chip {
            padding: 8px 14px;
            background: var(--z-yellow);
            color: var(--z-black);
            font-size: 14px;
            border-radius: 20px;
            white-space: nowrap;
            border: 2px solid var(--z-red);
            cursor: pointer;
          }

          .zaza-filter-advanced-btn {
            padding: 8px 14px;
            background: var(--z-red);
            color: white;
            border-radius: 20px;
            font-size: 14px;
            white-space: nowrap;
            border: 2px solid var(--z-yellow);
            cursor: pointer;
          }

          .zaza-filter-panel {
            background: white;
            padding: 20px;
            border-radius: 14px;
            box-shadow: 0px 4px 12px rgba(0,0,0,0.2);
            border: 3px solid var(--z-yellow);
          }

          .zaza-filter-panel-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .zaza-filter-checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
          }

          .zaza-filter-apply,
          .zaza-filter-reset {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            font-size: 16px;
            text-align: center;
            margin-top: 10px;
            border: 2px solid var(--z-black);
            cursor: pointer;
          }

          .zaza-filter-apply {
            background: var(--z-red);
            color: white;
          }

          .zaza-filter-reset {
            background: var(--z-yellow);
            color: var(--z-black);
          }

          .zaza-bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 65px;
            background: var(--z-black);
            display: flex;
            justify-content: space-around;
            align-items: center;
            border-top: 4px solid var(--z-yellow);
            z-index: 999;
            box-shadow: 0px -2px 6px rgba(255,213,0,0.3);
          }

          .zaza-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 12px;
            color: var(--z-yellow);
            text-decoration: none;
            cursor: pointer;
          }

          .zaza-nav-item-active {
            color: var(--z-red);
          }

          .zaza-nav-icon {
            font-size: 22px;
            margin-bottom: 3px;
          }

          .zaza-premium-box {
            background: var(--z-yellow);
            border: 3px solid var(--z-red);
            padding: 12px;
            border-radius: 12px;
            margin-top: 15px;
          }

          .zaza-premium-title {
            font-weight: bold;
            color: var(--z-black);
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