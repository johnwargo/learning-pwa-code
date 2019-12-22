// @ts-check

// some constants used by the app
const DATA_STATES = ['Fresh', 'Server Cache', 'Error', 'Local Cache'];
const DATA_SOURCES = ['Network', 'Local', 'Offline', 'None'];
const ONLINE_STR = 'Online';
const OFFLINE_STR = 'Offline';
const STATUS_UNKNOWN = 'Unknown';

// create an object we'll use to hold the reference to 
// the PWA install event
let deferredPrompt;

function setMobileMenuActions() {
    // open and close the mobile menu
    let menuToggle = document.querySelector('#menu-toggle');
    let mobileMenu = document.querySelector('#navigation');
    menuToggle.addEventListener('click', function () {
        mobileMenu.classList.toggle('mobile-menu--open');
        this.classList.toggle('open');
    });
    // hide the mobile menu if it's open and the window is widened beyond mobile sizes
    var w2 = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;
    window.addEventListener('resize', function () {
        let w = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
        if (w > 768) {
            menuToggle.classList.remove('open');
            mobileMenu.classList.remove('mobile-menu--open');
        }
    })
}

function setNetworkStatus() {
    // what's our network status?
    let netStatus = (navigator.onLine) ? ONLINE_STR : OFFLINE_STR;
    // tell the developer (just for fun)
    console.log(`Network status: ${netStatus}`);

    // get a handle to the page body, offline status is page(body) 
    // wide, just in case
    let body = document.querySelector('body');
    // remove the online class (if it's there)
    body.classList.remove(ONLINE_STR.toLowerCase());
    // remove the offline class (if it's there)
    body.classList.remove(OFFLINE_STR.toLowerCase());

    // set the presence value (text)
    document.getElementById('presenceValue').textContent = netStatus;
    // add the status class to the object
    body.classList.add(netStatus.toLowerCase());
}

function doInstall() {
    console.log('doInstall');
    // we've tapped the install button, so hide it
    installButton.style.display = 'none';
    // execute the deferred installation prompt
    deferredPrompt.prompt();
    // wait for the response from the deferred prompt
    deferredPrompt.userChoice.then(res => {
        // did the user approve installation?
        if (res.outcome === 'accepted') {
            console.log('doInstall: accepted');
        } else {
            console.log('doInstall: declined');
        }
        // clear the deferred prompt object so we can only do this once
        deferredPrompt = null;
    });
}

// what page did we load?
let pageFile = window.location.href.split('/').pop().split('#')[0].split('?')[0].toLowerCase();
console.log(`utils.js: ${pageFile} loading`);

// do the stuff we need to do for the index.htm file
if (pageFile.toLowerCase() == 'index.html') {
    console.log('utils.js: Updating index.html content');
    // did we launch as a PWA?
    var urlParams = new URLSearchParams(window.location.search);
    // look for the source parameter, if it's `pwa` then it's installed
    if (urlParams.get('source') === 'pwa') {
        console.log('Launched as PWA');
        // add the PWA moniker to the title
        let theTitle = document.getElementById('title');
        theTitle.innerHTML = theTitle.innerHTML + ' (PWA)';
    }

    // get a handle to the install button
    let installButton = document.getElementById('installButton');
    // now set the click handler for the install button
    installButton.onclick = doInstall;

    // now add an event listener to respond to the event. Right before the browser
    // installs the PWA, it fires the beforeinstallprompt event. Here, we'll manage
    // the installation ourselves
    window.addEventListener('beforeinstallprompt', event => {
        console.log('Event: beforeinstallprompt')
        // don't allow the browser to do its install, we want to do it when the user
        // taps our install button
        event.preventDefault();
        // stash the event object so we can use it later (when the user taps the 
        // install button)
        deferredPrompt = event;
        // now unhide the Install button so the user can tap it!
        installButton.style.display = 'block';
    });

    // register an event listener for after the app installs
    window.addEventListener('appinstalled', event => {
        console.log('App Installed');

    });
}

// index and feedback pages have network status footers
if (pageFile == 'index.html' || pageFile == 'feedback.html') {
    // register event listener for both online and offline events
    // so we can make sure the UI updates accordingly and it always
    // understands the current state
    console.log('Registering Network Status event listeners');
    window.addEventListener("offline", setNetworkStatus);
    window.addEventListener("online", setNetworkStatus);
    // Set the footer values, we'll reset them later 
    // when status changes
    document.getElementById('presenceValue').textContent = STATUS_UNKNOWN;
    document.getElementById('sourceValue').textContent = STATUS_UNKNOWN;
    // Set the initial network status on the footer
    setNetworkStatus();
}

// Setup the menu (all pages)
setMobileMenuActions();
