import MarketplaceDashboard from './pages/MarketplaceDashboard';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import NewListing from './pages/NewListing';
import __Layout from './Layout.jsx';


export const PAGES = {
    "MarketplaceDashboard": MarketplaceDashboard,
    "Marketplace": Marketplace,
    "ListingDetail": ListingDetail,
    "NewListing": NewListing,
}

export const pagesConfig = {
    mainPage: "MarketplaceDashboard",
    Pages: PAGES,
    Layout: __Layout,
};