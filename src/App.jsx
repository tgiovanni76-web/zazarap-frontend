import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Business from './pages/Business';
import BusinessContact from './pages/BusinessContact';
import AdminCampaigns from './pages/AdminCampaigns';
import MessagesV2 from './pages/MessagesV2.jsx';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const CanonicalMessagesRedirect = () => {
  const to = `/messages${window.location.search || ''}${window.location.hash || ''}`;
  console.warn('[RouteAlias][/Messages->]', to);
  return <Navigate to={to} replace />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin, checkAppState } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    const currentPath = (window.location.pathname || '').toLowerCase();
    console.warn('[AuthGuard] authError:', authError?.type, 'path=', currentPath);
    if (authError.type === 'user_not_registered') {
      console.warn('[AuthGuard] Rendering UserNotRegisteredError');
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      const tokenInStorage = (() => { try { return localStorage.getItem('base44_access_token'); } catch { return null; } })();
      if (tokenInStorage) {
        console.warn('[AuthGuard] Token found in storage; re-checking auth before redirect');
        checkAppState();
        return (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          </div>
        );
      }
      console.warn('[AuthGuard] Redirecting to login');
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {/* Force new chat experience - canonical lowercase path */}
      <Route path="/messages" element={<LayoutWrapper currentPageName="Messages"><MessagesV2 /></LayoutWrapper>} />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/listingdetail" element={<LayoutWrapper currentPageName="ListingDetail"><Pages.ListingDetail /></LayoutWrapper>} />
      {/* One-way alias: /Messages -> /messages (preserve query/hash) */}
      <Route path="/Messages" element={<CanonicalMessagesRedirect />} />

      <Route path="/Business" element={<LayoutWrapper currentPageName="Business"><Business /></LayoutWrapper>} />
      <Route path="/BusinessContact" element={<LayoutWrapper currentPageName="BusinessContact"><BusinessContact /></LayoutWrapper>} />
      <Route path="/AdminCampaigns" element={<LayoutWrapper currentPageName="AdminCampaigns"><AdminCampaigns /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App