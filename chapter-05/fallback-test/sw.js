self.addEventListener('activate', event => {
  console.log(`SW: ${event.type} event fired`);
  console.dir(event);
  // apply this service worker to all tabs running the app
  self.clients.claim();
});

self.addEventListener('install', event => {
  console.log(`SW: Event fired: ${event.type}`);
  console.dir(event);
  // force service worker activation
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // cache all requested files
  console.log(`SW: ${event.type} ${event.request.url}`);
  // fires whenever the app requests a resource (file or data)
  event.respondWith(
    // try to get the file from the network
    fetch(event.request)
      // whew, we got it
      .then((response) => {
        // do we have a valid response?
        if (response && response.status == 200
          && response.type == 'basic') {
          // clone the response; it's a stream, so we can't
          // write it to the cache and return it as well
          let responseClone = response.clone();
          // try to open the cache
          caches.open('fallback-test-cache')
            // if we successfully opened the cache
            .then(function (cache) {
              console.log(`SW: Adding ${event.request.url} to the cache`);
              // then write our cloned response to the cache
              cache.put(event.request, responseClone);
            });
          // return the original response
          return response;
        } else {
          // return whatever error response we got from the server
          return response;
        }
      })  //then
      .catch(() => {
        // rats, network resources not available
        // do we have it in the cache?
        console.log(`SW: Trying Cache ${event.request.url}`);
        return caches.match(event.request)
          .then(response => {
            // if it is, then return the cached response
            // object from the cache
            if (response) {
              console.log(`SW: Return Cache ${event.request.url}`);
              return response;
            }
          })
      })  // catch
  );
});

self.addEventListener("sync", event => {
  console.log(`SW: Event fired: ${event.type}`);
  console.log(event);
  if (event.tag == 'testSync') {    
    if (event.lastChance) console.warn('Last chance');
    event.waitUntil(mySyncFunction());
  }
});

function mySyncFunction() {
  var d = new Date();
  console.log(`Executing mySyncFunction at ${d.toLocaleTimeString()}`);
  return Promise.reject(new Error("Rejection!"));
};