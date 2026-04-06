import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];

    // Post navigation changes to parent window
    useEffect(() => {
        console.warn('[NavigationTracker] location:', location.pathname + location.search + location.hash);
        // In preview, if URL carries access_token, send a sanitized URL (without the token) instead of suppressing
        const host = window.location.hostname || '';
        const inPreview = host.includes('preview-sandbox') || window.top !== window.self;
        const hasAccessToken = (window.location.search || '').includes('access_token=');
        const buildSanitizedUrl = () => {
            try {
                const u = new URL(window.location.href);
                u.searchParams.delete('access_token');
                return u.toString();
            } catch {
                return window.location.href
                  .replace(/([?&])access_token=[^&#]*/, '$1')
                  .replace(/[?&]$/, '');
            }
        };
        const urlToPost = inPreview && hasAccessToken ? buildSanitizedUrl() : window.location.href;
        window.parent?.postMessage({ type: "app_changed_url", url: urlToPost }, '*');
    }, [location]);

    // Log user activity when navigating to a page
    useEffect(() => {
        // Extract page name from pathname
        const pathname = location.pathname;
        let pageName;
        
        if (pathname === '/' || pathname === '') {
            pageName = mainPageKey;
        } else {
            // Remove leading slash and get the first segment
            const pathSegment = pathname.replace(/^\//, '').split('/')[0];
            
            // Try case-insensitive lookup in Pages config
            const pageKeys = Object.keys(Pages);
            const matchedKey = pageKeys.find(
                key => key.toLowerCase() === pathSegment.toLowerCase()
            );
            
            pageName = matchedKey || null;
        }

        if (isAuthenticated && pageName) {
            base44.appLogs.logUserInApp(pageName).catch(() => {
                // Silently fail - logging shouldn't break the app
            });
        }
    }, [location, isAuthenticated, Pages, mainPageKey]);

    return null;
}