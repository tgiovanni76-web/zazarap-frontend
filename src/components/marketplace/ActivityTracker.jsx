import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export function useActivityTracker(user) {
  const startTimeRef = useRef(null);

  const trackView = async (listingId, category, city, source = 'direct') => {
    if (!user?.email) return;
    
    try {
      await base44.entities.UserActivity.create({
        userId: user.email,
        activityType: 'view',
        listingId,
        category,
        city,
        source
      });
    } catch (e) {
      console.error('Track view error:', e);
    }
  };

  const trackSearch = async (searchTerm, category, priceRange) => {
    if (!user?.email || !searchTerm) return;
    
    try {
      await base44.entities.UserActivity.create({
        userId: user.email,
        activityType: 'search',
        searchTerm,
        category,
        priceRange
      });
    } catch (e) {
      console.error('Track search error:', e);
    }
  };

  const trackClick = async (listingId, category, source) => {
    if (!user?.email) return;
    
    try {
      await base44.entities.UserActivity.create({
        userId: user.email,
        activityType: 'click',
        listingId,
        category,
        source
      });
    } catch (e) {
      console.error('Track click error:', e);
    }
  };

  const startTimeTracking = () => {
    startTimeRef.current = Date.now();
  };

  const endTimeTracking = async (listingId) => {
    if (!user?.email || !startTimeRef.current) return;
    
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (timeSpent > 5) { // Solo se > 5 secondi
      try {
        await base44.entities.UserActivity.create({
          userId: user.email,
          activityType: 'view',
          listingId,
          timeSpent
        });
      } catch (e) {
        console.error('Track time error:', e);
      }
    }
    startTimeRef.current = null;
  };

  return {
    trackView,
    trackSearch,
    trackClick,
    startTimeTracking,
    endTimeTracking
  };
}

export default useActivityTracker;