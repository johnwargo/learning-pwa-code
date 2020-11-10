/*********************************************************
 * Listing 3.5
 * 
 * This is a simple Service Worker that simply logs the 
 * request to the console, then returns a promise to 
 * fetch the requested file. 
 *********************************************************/

self.addEventListener('fetch', event => {
    // fires whenever the app requests a resource (file or data)
    console.log(`SW: Fetching ${event.request.url}`);
    // next, go get the requested resource from the network, 
    // nothing fancy going on here.
    event.respondWith(fetch(event.request));
});