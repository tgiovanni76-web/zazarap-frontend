/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AGB from './pages/AGB';
import AccessibilityAudit from './pages/AccessibilityAudit';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminAutoModeration from './pages/AdminAutoModeration';
import AdminDashboard from './pages/AdminDashboard';
import AdminDisputes from './pages/AdminDisputes';
import AdminModeration from './pages/AdminModeration';
import AdminPayments from './pages/AdminPayments';
import AdminReports from './pages/AdminReports';
import AdminSEO from './pages/AdminSEO';
import AdminSettings from './pages/AdminSettings';
import AdminTickets from './pages/AdminTickets';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Cart from './pages/Cart';
import Category from './pages/Category';
import CompleteProfile from './pages/CompleteProfile';
import Contact from './pages/Contact';
import CustomerSupport from './pages/CustomerSupport';
import DatenschutzDE from './pages/DatenschutzDE';
import DisputeCenter from './pages/DisputeCenter';
import EditListing from './pages/EditListing';
import EditProfile from './pages/EditProfile';
import FAQ from './pages/FAQ';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import Impressum from './pages/Impressum';
import ListingDetail from './pages/ListingDetail';
import ListingPerformance from './pages/ListingPerformance';
import LoyaltyProgram from './pages/LoyaltyProgram';
import ManageCategories from './pages/ManageCategories';
import ManageUsers from './pages/ManageUsers';
import Marketplace from './pages/Marketplace';
import MarketplaceDashboard from './pages/MarketplaceDashboard';
import Messages from './pages/Messages';
import ModerateListings from './pages/ModerateListings';
import MyOrders from './pages/MyOrders';
import MyPurchases from './pages/MyPurchases';
import MySales from './pages/MySales';
import MySubscriptions from './pages/MySubscriptions';
import NewListing from './pages/NewListing';
import NotificationCenter from './pages/NotificationCenter';
import NotificationSettings from './pages/NotificationSettings';
import Notifications from './pages/Notifications';
import PayPalWebhook from './pages/PayPalWebhook';
import PreLaunchChecklist from './pages/PreLaunchChecklist';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PromoteListing from './pages/PromoteListing';
import Recommendations from './pages/Recommendations';
import ReferralDashboard from './pages/ReferralDashboard';
import RejectedListings from './pages/RejectedListings';
import SellerAITools from './pages/SellerAITools';
import SellerDashboard from './pages/SellerDashboard';
import SellerHub from './pages/SellerHub';
import SystemCheckup from './pages/SystemCheckup';
import SystemLogs from './pages/SystemLogs';
import TermsOfService from './pages/TermsOfService';
import Transactions from './pages/Transactions';
import UserProfile from './pages/UserProfile';
import UserSettings from './pages/UserSettings';
import Werbung from './pages/Werbung';
import Widerrufsrecht from './pages/Widerrufsrecht';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AGB": AGB,
    "AccessibilityAudit": AccessibilityAudit,
    "AdminAnalytics": AdminAnalytics,
    "AdminAutoModeration": AdminAutoModeration,
    "AdminDashboard": AdminDashboard,
    "AdminDisputes": AdminDisputes,
    "AdminModeration": AdminModeration,
    "AdminPayments": AdminPayments,
    "AdminReports": AdminReports,
    "AdminSEO": AdminSEO,
    "AdminSettings": AdminSettings,
    "AdminTickets": AdminTickets,
    "Blog": Blog,
    "BlogPost": BlogPost,
    "Cart": Cart,
    "Category": Category,
    "CompleteProfile": CompleteProfile,
    "Contact": Contact,
    "CustomerSupport": CustomerSupport,
    "DatenschutzDE": DatenschutzDE,
    "DisputeCenter": DisputeCenter,
    "EditListing": EditListing,
    "EditProfile": EditProfile,
    "FAQ": FAQ,
    "Favorites": Favorites,
    "Home": Home,
    "Impressum": Impressum,
    "ListingDetail": ListingDetail,
    "ListingPerformance": ListingPerformance,
    "LoyaltyProgram": LoyaltyProgram,
    "ManageCategories": ManageCategories,
    "ManageUsers": ManageUsers,
    "Marketplace": Marketplace,
    "MarketplaceDashboard": MarketplaceDashboard,
    "Messages": Messages,
    "ModerateListings": ModerateListings,
    "MyOrders": MyOrders,
    "MyPurchases": MyPurchases,
    "MySales": MySales,
    "MySubscriptions": MySubscriptions,
    "NewListing": NewListing,
    "NotificationCenter": NotificationCenter,
    "NotificationSettings": NotificationSettings,
    "Notifications": Notifications,
    "PayPalWebhook": PayPalWebhook,
    "PreLaunchChecklist": PreLaunchChecklist,
    "PrivacyPolicy": PrivacyPolicy,
    "PromoteListing": PromoteListing,
    "Recommendations": Recommendations,
    "ReferralDashboard": ReferralDashboard,
    "RejectedListings": RejectedListings,
    "SellerAITools": SellerAITools,
    "SellerDashboard": SellerDashboard,
    "SellerHub": SellerHub,
    "SystemCheckup": SystemCheckup,
    "SystemLogs": SystemLogs,
    "TermsOfService": TermsOfService,
    "Transactions": Transactions,
    "UserProfile": UserProfile,
    "UserSettings": UserSettings,
    "Werbung": Werbung,
    "Widerrufsrecht": Widerrufsrecht,
}

export const pagesConfig = {
    mainPage: "MarketplaceDashboard",
    Pages: PAGES,
    Layout: __Layout,
};