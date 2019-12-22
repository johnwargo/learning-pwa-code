// @ts-check
/**
 * Service Worker 4.1
 * 
 * Caches an array of app resources
 */

var urlList = [
  '/',
  '/app.webmanifest',
  '/index.html',
  '/css/custom.css',
  '/img/bing-logo.png',
  '/js/index.js',
  '/js/sw-reg.js',
  '/js/utils.js',
];

self.addEventListener('install', event => {
  console.log(`SW: ${event.type} event fired`);
  // the service worker is installing, so it's our chance
  // to setup the app. In this case, we're telling   
  // the browser to wait until we've populated the cache
  // before considering this service worker installed
  event.waitUntil(
    // create a local cache for our app resources
    caches.open('pwa-learn-cache')
      // once it's open...
      .then(cache => {
        console.log('SW: Cache opened');
        // cache all of resources from the array
        return cache.addAll(urlList);
      })
      .catch(error => {
        console.error(error);
      })
  );
});

self.addEventListener('activate', event => {
  // fires after the service worker completes its installation. 
  // it's a place for the service worker to clean up from previous 
  // service worker versions
  console.log(`SW: ${event.type} event fired`);
});

self.addEventListener('fetch', event => {
  console.log(`SW: ${event.type} ${event.request.url}`);
  // fires whenever the app requests a resource (file or data)
  event.respondWith(
    // check to see if it's in the cache
    caches.match(event.request)
      .then(function (response) {
        // if it is, then return the cached response
        // object from the cache
        if (response) {
          console.log(`SW: Return Cache ${event.request.url}`);
          return response;
        }
        // otherwise, tell the browser to go get the
        // resource from the network
        console.log(`SW: Return Network ${event.request.url}`);
        return fetch(event.request)
      })
  );
});
