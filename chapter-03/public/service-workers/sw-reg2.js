// define a variable to hold a reference to the 
// registration object (reg)
var regObject;

// does the browser support service workers?
if ('serviceWorker' in navigator) {
    // then register our service worker
    navigator.serviceWorker.register('/sw-36.js')
        .then(reg => {
            // display a success message
            console.log(`Service Worker Registration (Scope: ${reg.scope})`);
            // store the `reg` object away for later use
            regObject = reg;
            // setup the interval timer            
            setTimeout(requestUpgrade, 5000);
        })
        .catch(error => {
            // display an error message
            let msg = `Service Worker Error (${error})`;
            console.error(msg);
            // display a warning dialog (using Sweet Alert 2)
            Swal.fire('Registration Error', msg, 'error');
        });
} else {
    // happens when the app isn't served over a TLS connection (HTTPS)
    // or if the browser doesn't support service workers
    console.warn('Service Worker not available');
    // we're not going to use an alert dialog here 
    // because if it doesn't work, it doesn't work;
    // this doesn't change the behavior of the app 
    // for the user
}

function requestUpgrade() {
    console.log('Requesting an upgrade');
    regObject.update();
}