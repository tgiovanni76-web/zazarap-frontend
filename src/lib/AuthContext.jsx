import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

// Helper to capture token from URL into localStorage and strip it once
const ensureTokenFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search || '');
    const t = params.get('access_token');
    if (t) {
      localStorage.setItem('base44_access_token', t);
      const host = window.location?.hostname || '';
      const inPreview = host.includes('preview-sandbox') || window.top !== window.self;
      if (!inPreview) {
        // Outside preview we can safely strip the token from URL
        params.delete('access_token');
        const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash || ''}`;
        window.history.replaceState({}, document.title, newUrl);
      } else {
        console.warn('[AuthContext] Preview sandbox: keeping access_token in URL to avoid host rewrite loop');
      }
    }
  } catch {}
};

const getStoredToken = () => {
  try {
    return localStorage.getItem('base44_access_token') || null;
  } catch {
    return null;
  }
};

// Detect if running in the Base44 preview sandbox (iframe)
const isInPreviewSandbox = () => {
  try {
    const host = window.location.hostname || '';
    return host.includes('preview-sandbox') || window.top !== window.self;
  } catch {
    return false;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    // On mount, capture token from URL to storage and then check state
    ensureTokenFromUrl();
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // First, check app public settings (with token if available)
      // This will tell us if auth is required, user not registered, etc.
      // Refresh token from URL/localStorage before hitting public settings
      ensureTokenFromUrl();
      const freshToken = getStoredToken() || appParams.token;

      const appClient = createAxiosClient({
        baseURL: `${appParams.serverUrl}/api/apps/public`,
        headers: {
          'X-App-Id': appParams.appId
        },
        token: freshToken, // Always use the freshest token
        interceptResponses: true
      });
      
      try {
        const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
        setAppPublicSettings(publicSettings);
        
        // If we got the app public settings successfully, check if user is authenticated
        if (freshToken) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('App state check failed:', appError);
        
        // Handle app-level errors
        if (appError.status === 403 && appError.data?.extra_data?.reason) {
          const reason = appError.data.extra_data.reason;
          if (reason === 'auth_required') {
            setAuthError({
              type: 'auth_required',
              message: 'Authentication required'
            });
          } else if (reason === 'user_not_registered') {
            setAuthError({
              type: 'user_not_registered',
              message: 'User not registered for this app'
            });
          } else {
            setAuthError({
              type: reason,
              message: appError.message
            });
          }
        } else {
          setAuthError({
            type: 'unknown',
            message: appError.message || 'Failed to load app'
          });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      
      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // If a fresh token exists (just returned from OAuth), avoid another redirect
    try {
      const t = localStorage.getItem('base44_access_token');
      if (t) {
        console.warn('[AuthContext] Token present; skip redirectToLogin');
        return;
      }
    } catch {}

    // In preview sandbox, do NOT auto-redirect to avoid iframe redirect loops
    if (isInPreviewSandbox()) {
      console.warn('[AuthContext] Preview sandbox detected; skipping auto redirect to login');
      return;
    }

    console.warn('[AuthContext] redirectToLogin called with next=', window.location.href);
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};