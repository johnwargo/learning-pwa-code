/***************************************************************************
 Hey, I thought we agreed that we weren't going to dig into Service Workers 
 in this chapter, what gives?  OK, I'll explain the contents of this file 
 below, but you can also find more information in the following chapters 
 (where I cover Service Workers) or here: 
 https://developers.google.com/web/ilt/pwa/introduction-to-service-worker

 Since this is a service worker for an app I'm using to just illustrate 
 how to how to use an web manifest file to install it, it doesn't actually
 do anything. All it does is register event listeners for the Service 
 Worker events then, in those event listeners, it dumps the event object
 to the console. That's really it.

 In the chapters that follow, I'll show how to do file caching, deal with 
 service worker upgrades, and other cool stuff. 
***************************************************************************/

self.addEventListener('install', event => {
    // fires when the browser installs the app
    // here we're just logging the event and the contents
    // of the object passed to the event. the purpose of this event
    // is to give the service worker a place to setup the local 
    // environment after the installation completes.
    console.log(`Event fired: ${event.type}`);
    console.dir(event);
});

self.addEventListener('activate', event => {
    // fires after the service worker completes its installation. 
    // It's a place for the service worker to clean up from previous 
    // service worker versions
    console.log(`Event fired: ${event.type}`);
    console.dir(event);
});

self.addEventListener('fetch', event => {
    // Fires whenever the app requests a resource (file or data)
    // normally this is where the service worker would check to see
    // if the requested resource is in the local cache before going
    // to the server to get it. There's a whole chapter in the book
    // covering different cache strategies, so I'm not going to say 
    // any more about this here
    console.log(`Fetching ${event.request.url}`);
    // console.dir(event.request);
    // Next, go get the requested resource from the network, 
    // nothing fancy going on here.
    event.respondWith(fetch(event.request));
});