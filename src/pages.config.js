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
import AdminDashboard from './pages/AdminDashboard';
import AdminDisputes from './pages/AdminDisputes';
import AdminModeration from './pages/AdminModeration';
import AdminPayments from './pages/AdminPayments';
import AdminReports from './pages/AdminReports';
import AdminSEO from './pages/AdminSEO';
import AdminSettings from './pages/AdminSettings';
import AdminTickets from './pages/AdminTickets';
import AppStoreGuide from './pages/AppStoreGuide';
import Category from './pages/Category';
import CompleteProfile from './pages/CompleteProfile';
import Contact from './pages/Contact';
import CookieRichtlinie from './pages/CookieRichtlinie';
import CustomerSupport from './pages/CustomerSupport';
import Datenschutz from './pages/Datenschutz';
import DatenschutzDE from './pages/DatenschutzDE';
import DisputeCenter from './pages/DisputeCenter';
import EditListing from './pages/EditListing';
import EditProfile from './pages/EditProfile';
import FAQ from './pages/FAQ';
import Favorites from './pages/Favorites';
import Hilfe from './pages/Hilfe';
import Home from './pages/Home';
import Impressum from './pages/Impressum';
import LegalReview from './pages/LegalReview';
import ListingDetail from './pages/ListingDetail';
import ManageCategories from './pages/ManageCategories';
import ManageUsers from './pages/ManageUsers';
import Marketplace from './pages/Marketplace';
import Messages from './pages/Messages';
import MobileAppChecklist from './pages/MobileAppChecklist';
import ModerateListings from './pages/ModerateListings';
import MyListings from './pages/MyListings';
import NewListing from './pages/NewListing';
import NotificationCenter from './pages/NotificationCenter';
import NotificationSettings from './pages/NotificationSettings';
import Notifications from './pages/Notifications';
import Nutzungsbedingungen from './pages/Nutzungsbedingungen';
import OTPLogin from './pages/OTPLogin';
import Plattformregeln from './pages/Plattformregeln';
import PreLaunchChecklist from './pages/PreLaunchChecklist';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Recommendations from './pages/Recommendations';
import RejectedListings from './pages/RejectedListings';
import SellerDashboard from './pages/SellerDashboard';
import SellerHub from './pages/SellerHub';
import SicherheitsHinweise from './pages/SicherheitsHinweise';
import Support from './pages/Support';
import SystemCheckup from './pages/SystemCheckup';
import SystemLogs from './pages/SystemLogs';
import TermsOfService from './pages/TermsOfService';
import UeberUns from './pages/UeberUns';
import UserProfile from './pages/UserProfile';
import UserSettings from './pages/UserSettings';
import WarumPremium from './pages/WarumPremium';
import Widerrufsrecht from './pages/Widerrufsrecht';
import listingDetail from './pages/listing-detail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AGB": AGB,
    "AccessibilityAudit": AccessibilityAudit,
    "AdminDashboard": AdminDashboard,
    "AdminDisputes": AdminDisputes,
    "AdminModeration": AdminModeration,
    "AdminPayments": AdminPayments,
    "AdminReports": AdminReports,
    "AdminSEO": AdminSEO,
    "AdminSettings": AdminSettings,
    "AdminTickets": AdminTickets,
    "AppStoreGuide": AppStoreGuide,
    "Category": Category,
    "CompleteProfile": CompleteProfile,
    "Contact": Contact,
    "CookieRichtlinie": CookieRichtlinie,
    "CustomerSupport": CustomerSupport,
    "Datenschutz": Datenschutz,
    "DatenschutzDE": DatenschutzDE,
    "DisputeCenter": DisputeCenter,
    "EditListing": EditListing,
    "EditProfile": EditProfile,
    "FAQ": FAQ,
    "Favorites": Favorites,
    "Hilfe": Hilfe,
    "Home": Home,
    "Impressum": Impressum,
    "LegalReview": LegalReview,
    "ListingDetail": ListingDetail,
    "ManageCategories": ManageCategories,
    "ManageUsers": ManageUsers,
    "Marketplace": Marketplace,
    "Messages": Messages,
    "MobileAppChecklist": MobileAppChecklist,
    "ModerateListings": ModerateListings,
    "MyListings": MyListings,
    "NewListing": NewListing,
    "NotificationCenter": NotificationCenter,
    "NotificationSettings": NotificationSettings,
    "Notifications": Notifications,
    "Nutzungsbedingungen": Nutzungsbedingungen,
    "OTPLogin": OTPLogin,
    "Plattformregeln": Plattformregeln,
    "PreLaunchChecklist": PreLaunchChecklist,
    "PrivacyPolicy": PrivacyPolicy,
    "Recommendations": Recommendations,
    "RejectedListings": RejectedListings,
    "SellerDashboard": SellerDashboard,
    "SellerHub": SellerHub,
    "SicherheitsHinweise": SicherheitsHinweise,
    "Support": Support,
    "SystemCheckup": SystemCheckup,
    "SystemLogs": SystemLogs,
    "TermsOfService": TermsOfService,
    "UeberUns": UeberUns,
    "UserProfile": UserProfile,
    "UserSettings": UserSettings,
    "WarumPremium": WarumPremium,
    "Widerrufsrecht": Widerrufsrecht,
    "listing-detail": listingDetail,
}

export const pagesConfig = {
    mainPage: "AGB",
    Pages: PAGES,
    Layout: __Layout,
};