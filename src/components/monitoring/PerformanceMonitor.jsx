import React from 'react';
import { base44 } from '@/api/base44Client';

export default function PerformanceMonitor() {
  React.useEffect(() => {
    const metrics = {
      path: window.location.pathname + window.location.search,
      userAgent: navigator.userAgent,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      connection: (navigator.connection && {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      }) || null,
      navigation: null,
      fcp: null,
      lcp: null,
      cls: null
    };

    // Navigation timing
    try {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) {
        metrics.navigation = {
          domContentLoaded: nav.domContentLoadedEventEnd,
          load: nav.loadEventEnd,
          transferSize: nav.transferSize,
          decodedBodySize: nav.decodedBodySize,
        };
      }
    } catch {}

    // First Contentful Paint
    try {
      const po = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint' && !metrics.fcp) {
            metrics.fcp = entry.startTime;
          }
        });
      });
      po.observe({ type: 'paint', buffered: true });
    } catch {}

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) metrics.lcp = last.startTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // @ts-ignore
          if (!entry.hadRecentInput) {
            // @ts-ignore
            clsValue += entry.value || 0;
          }
        }
        metrics.cls = clsValue;
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {}

    const send = async () => {
      try {
        await base44.functions.invoke('perfBeacon', { metrics });
      } catch {}
    };

    // Send shortly after load to collect buffered entries
    const t = setTimeout(send, 3000);
    return () => clearTimeout(t);
  }, []);

  return null;
}