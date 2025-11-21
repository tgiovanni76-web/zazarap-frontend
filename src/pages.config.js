import MarketplaceDashboard from './pages/MarketplaceDashboard';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import NewListing from './pages/NewListing';
import Messages from './pages/Messages';
import Favorites from './pages/Favorites';
import Category from './pages/Category';
import EditListing from './pages/EditListing';
import Notifications from './pages/Notifications';
import __Layout from './Layout.jsx';


export const PAGES = {
    "MarketplaceDashboard": MarketplaceDashboard,
    "Marketplace": Marketplace,
    "ListingDetail": ListingDetail,
    "NewListing": NewListing,
    "Messages": Messages,
    "Favorites": Favorites,
    "Category": Category,
    "EditListing": EditListing,
    "Notifications": Notifications,
}

export const pagesConfig = {
    mainPage: "MarketplaceDashboard",
    Pages: PAGES,
    Layout: __Layout,
};