/*********************************************************
 * Listing 3.8
 * 
 * this is a simple Service Worker that simply logs the 
 * request to the console, then returns a promise to 
 * fetch the requested file. It forces the worker
 * to activate through the use of `skipWaiting()` and
 * adds a call to `self.clients.claim()` to claim all tabs
 *********************************************************/

self.addEventListener('install', event => {
    // fires when the browser installs the app
    // here we're just logging the event and the contents
    // of the object passed to the event. the purpose of this event
    // is to give the service worker a place to setup the local 
    // environment after the installation completes.
    console.log(`SW: Event fired: ${event.type}`);
    console.dir(event);
    // force service worker activation
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    // fires after the service worker completes its installation. 
    // it's a place for the service worker to clean up from previous 
    // service worker versions
    console.log(`SW: Event fired: ${event.type}`);
    console.dir(event);
    // apply this service worker to all tabs running the app
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // fires whenever the app requests a resource (file or data)
    console.log(`SW: Fetching ${event.request.url}`);
    // next, go get the requested resource from the network, 
    // nothing fancy going on here.
    event.respondWith(fetch(event.request));
});