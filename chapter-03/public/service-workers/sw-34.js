/*********************************************************
 * Listing 3.4
 * 
 * This is a simple Service Worker that simply logs the 
 * request to the console.
 *********************************************************/

self.addEventListener('fetch', event => {
    // fires whenever the app requests a resource (file or data)
    console.log(`SW: Fetching ${event.request.url}`);    
});