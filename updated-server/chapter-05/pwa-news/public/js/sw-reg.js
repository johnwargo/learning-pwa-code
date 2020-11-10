// does the browser support service workers?
if ('serviceWorker' in navigator) {
    // then register our service worker
    navigator.serviceWorker.register('/sw.js')
        .then(reg => {
            // display a success message
            console.log(`Service Worker Registration (Scope: ${reg.scope})`);
        })
        .catch(error => {
            // display an error message
            let msg = `Service Worker Error (${error})`;
            console.log(msg);
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
