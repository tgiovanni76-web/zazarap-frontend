import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Alias page: gracefully redirect old/deep links from "listing-detail" to the canonical "ListingDetail" page
export default function ListingDetailAlias() {
  const navigate = useNavigate();

  useEffect(() => {
    const query = window.location.search || '';
    // Preserve all query parameters (e.g., ?id=...) and replace history entry
    navigate(createPageUrl('ListingDetail') + query, { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-slate-500 text-sm">
      Reindirizzamento...
    </div>
  );
}