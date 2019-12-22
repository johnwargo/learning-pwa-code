self.addEventListener('install', event => {
    // fires when the browser installs the app
    // here we're just logging the event and the contents
    // of the object passed to the event. the purpose of this event
    // is to give the service worker a place to setup the local 
    // environment after the installation completes.
    console.log(`SW: Event fired: ${event.type}`);
    console.dir(event);
    // Force service worker activation
    self.skipWaiting();
  });
  
  self.addEventListener('activate', event => {
    // fires after the service worker completes its installation. 
    // It's a place for the service worker to clean up from previous 
    // service worker versions
    console.log(`SW: Event fired: ${event.type}`);
    console.dir(event);
    // apply this service worker to all tabs running the app
    self.clients.claim();
  });
  
  self.addEventListener('fetch', event => {
    // Fires whenever the app requests a resource (file or data)
    console.log(`SW: Fetching ${event.request.url}`);
    // Next, go get the requested resource from the network, 
    // nothing fancy going on here.
    event.respondWith(fetch(event.request));
  });
  
  self.addEventListener('push', event => {
    console.log('SW: Push event fired');
    console.dir(event);
    const data = event.data.json();
    console.dir(data);
    console.dir(JSON.parse(data.actions));
  
    // We don't want the Service Worker killing us
    // notification before we're done displaying it,
    // so we put this in a waitUntil block
    event.waitUntil(
      self.registration.showNotification(data.title, data)
    );
  });
  
  self.addEventListener('notificationclick', event => {
    console.log('SW: Notification clicked');
    console.dir(event);
    if (event.action === 'like') {
      event.waitUntil(
        // Do something for the like action
  
      );
    } else {
      event.waitUntil(
        // Do something for the dislike action
  
      );
    }
  });
  
  self.addEventListener("pushsubscriptionchange", event => {
    console.log('SW: Push Subscription Change event fired');
    console.dir(event);
  
    event.waitUntil(
      self.pushManager.subscribe(regOptions)
        .then(subscription => {
          console.log('Browser re-subscribed');
          console.log(subscription)        
          // Now, send the subscription object to the server
          // just like we did in index.js
  
        })
        .catch(error => {
          // hmmm, that didn't work
          console.error(error);
        })
    );
  });
  