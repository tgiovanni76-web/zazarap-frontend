export function createPageUrl(pageName: string) {
    // Preserve page key casing so it matches the router (e.g., "/Messages", "/ListingDetail")
    return '/' + String(pageName).replace(/\s+/g, '');
}