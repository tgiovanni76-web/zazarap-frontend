import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, ShoppingBag, Plus, Bell, Heart, MessageSquare, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Layout({ children, currentPageName }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ userId: user.email, read: false }),
    enabled: !!user,
  });

  const unreadCount = notifications.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
          :root {
            --z-gray-light: #F2F2F2;
            --z-red: #E10600;
            --z-yellow: #FFD500;
            --z-black: #333333;
          }

          /* HEADER */
          .zaza-header {
            background: #ffffff;
            color: var(--z-red);
            padding: 16px;
            font-size: 22px;
            font-weight: bold;
            border-bottom: 3px solid var(--z-red);
            text-align: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          }

          /* SEARCH BAR */
          .zaza-search {
            background: var(--z-gray-light);
            border: 2px solid var(--z-red);
            padding: 12px;
            border-radius: 12px;
            font-size: 16px;
            margin: 14px;
          }

          /* CATEGORIE */
          .zaza-cat-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
            padding: 10px;
          }

          .zaza-cat-card {
            background: var(--z-yellow);
            color: var(--z-red);
            border-radius: 14px;
            padding: 20px;
            text-align: center;
            font-weight: bold;
            border: 2px solid var(--z-red);
            font-size: 20px;
          }

          .zaza-cat-card span {
            display: block;
            font-size: 14px;
            margin-top: 6px;
          }

          /* ANNUNCI */
          .zaza-card {
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            padding-bottom: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            position: relative;
          }

          .zaza-card-title {
            color: var(--z-black);
            font-weight: bold;
            margin: 8px;
          }

          .zaza-card-price {
            color: var(--z-red);
            font-size: 18px;
            font-weight: bold;
            margin: 0 8px 8px;
          }

          /* PUBBLICA BUTTON */
          .zaza-btn-pubblica {
            background: var(--z-red);
            color: white;
            padding: 15px;
            margin: 16px;
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
            background: white;
            display: flex;
            justify-content: space-around;
            padding: 10px 0;
            border-top: 1px solid #ddd;
          }

          .zaza-footer-item {
            color: var(--z-black);
            text-align: center;
            font-size: 12px;
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
            background: var(--z-gray-light);
          }

          .zaza-heart {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,255,255,0.9);
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
            color: var(--z-black);
          }

          .zaza-price {
            font-size: 16px;
            font-weight: bold;
            color: var(--z-red);
            margin: 0 6px;
          }

          .zaza-location {
            font-size: 12px;
            color: #666;
            margin: 0 6px 6px 6px;
          }

          .zaza-category {
            display: inline-block;
            background: var(--z-yellow);
            color: var(--z-red);
            padding: 2px 8px;
            font-size: 11px;
            border-radius: 6px;
            margin: 4px 6px;
            border: 1px solid var(--z-red);
          }

          .zaza-detail-img {
            width: 100%;
            height: 250px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 15px;
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
            background: var(--z-yellow);
            color: var(--z-red);
            padding: 4px 10px;
            font-size: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
            border: 2px solid var(--z-red);
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
            border: 1px solid #ccc;
            margin-bottom: 15px;
          }

          .zaza-upload {
            border: 2px dashed var(--z-red);
            color: var(--z-red);
            background: var(--z-gray-light);
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
            background: white;
            padding: 12px;
            border-radius: 12px;
            box-shadow: 0px 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 18px;
            border: 1px solid #ddd;
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
            border: 1px solid #ccc;
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
            border: none;
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
            background: var(--z-gray-light);
            color: var(--z-black);
            font-size: 14px;
            border-radius: 20px;
            white-space: nowrap;
            border: 1px solid #ccc;
            cursor: pointer;
          }

          .zaza-filter-advanced-btn {
            padding: 8px 14px;
            background: var(--z-red);
            color: white;
            border-radius: 20px;
            font-size: 14px;
            white-space: nowrap;
            border: none;
            cursor: pointer;
          }

          .zaza-filter-panel {
            background: white;
            padding: 20px;
            border-radius: 14px;
            box-shadow: 0px 4px 12px rgba(0,0,0,0.2);
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
            border: none;
            cursor: pointer;
          }

          .zaza-filter-apply {
            background: var(--z-red);
            color: white;
          }

          .zaza-filter-reset {
            background: var(--z-gray-light);
            color: var(--z-black);
          }

          .zaza-bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 65px;
            background: white;
            display: flex;
            justify-content: space-around;
            align-items: center;
            border-top: 1px solid #ddd;
            z-index: 999;
            box-shadow: 0px -2px 6px rgba(0,0,0,0.08);
          }

          .zaza-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 12px;
            color: var(--z-black);
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
            background: #fff8e5;
            border: 2px solid var(--z-yellow);
            padding: 12px;
            border-radius: 12px;
            margin-top: 15px;
          }

          .zaza-premium-title {
            font-weight: bold;
            color: var(--z-red);
          }

          /* CHAT LAYOUT */
          .zaza-chat-container {
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          /* MESSAGGI SINISTRA (venditore) */
          .zaza-msg-left {
            max-width: 80%;
            padding: 10px;
            background: #e6e6e6;
            border-radius: 10px;
            align-self: flex-start;
          }

          /* MESSAGGI DESTRA (acquirente) */
          .zaza-msg-right {
            max-width: 80%;
            padding: 10px;
            background: #d4f6c6;
            border-radius: 10px;
            align-self: flex-end;
          }

          /* PREZZO NEL MESSAGGIO */
          .zaza-price-tag {
            font-weight: bold;
            color: #E10600;
          }

          /* BOX INPUT */
          .zaza-chat-inputbox {
            position: fixed;
            bottom: 60px;
            left: 0;
            right: 0;
            background: white;
            padding: 10px;
            display: flex;
            gap: 10px;
          }

          /* PULSANTI DEL VENDITORE */
          .zaza-offer-buttons {
            display: flex;
            gap: 10px;
            margin-top: 10px;
          }

          .zaza-btn-accept {
            background: #4CAF50;
            color: white;
            padding: 10px;
            border-radius: 10px;
            text-align: center;
            flex: 1;
          }

          .zaza-btn-reject {
            background: #FF5252;
            color: white;
            padding: 10px;
            border-radius: 10px;
            text-align: center;
            flex: 1;
          }

          .zaza-btn-counter {
            background: #FFBF00;
            color: black;
            padding: 10px;
            border-radius: 10px;
            text-align: center;
            flex: 1;
          }
        `}</style>
      <header className="bg-yellow-400 py-3 shadow-md border-b-4 border-red-600">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Marketplace')} className="no-underline">
              <h1 className="text-2xl font-bold m-0 text-red-600">Zazarap</h1>
            </Link>

            <nav className="flex items-center gap-4">
              <Link to={createPageUrl('Marketplace')} className="text-red-600 hover:text-red-700 transition-colors" title="Home">
                <ShoppingBag className="h-6 w-6" />
              </Link>
              <Link to={createPageUrl('NewListing')} className="text-red-600 hover:text-red-700 transition-colors" title="Pubblica">
                <Plus className="h-6 w-6" />
              </Link>
              <Link to={createPageUrl('Favorites')} className="text-red-600 hover:text-red-700 transition-colors" title="Preferiti">
                <Heart className="h-6 w-6" />
              </Link>
              <Link to={createPageUrl('Messages')} className="text-red-600 hover:text-red-700 transition-colors" title="Messaggi">
                <MessageSquare className="h-6 w-6" />
              </Link>
              <Link to={createPageUrl('Notifications')} className="text-red-600 hover:text-red-700 transition-colors relative" title="Notifiche">
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-600 text-white px-1.5 py-0.5 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
              <Link to={createPageUrl('MarketplaceDashboard')} className="text-red-600 hover:text-red-700 transition-colors" title="Dashboard">
                <LayoutDashboard className="h-6 w-6" />
              </Link>
              {user?.role === 'admin' && (
                <Link to={createPageUrl('ManageUsers')} className="text-red-600 hover:text-red-700 transition-colors" title="Admin">
                  <Settings className="h-6 w-6" />
                </Link>
              )}
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