// @ts-check

(function () {
    'use strict';

    // https://flaviocopes.com/how-to-format-number-as-currency-javascript/
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    })

    function updateTipAmounts() {
        // grab the meal cost from the page
        let mealCost = document.getElementById("mealCost").value;
        // Populate the table with tip amounts
        document.getElementById('tip10').innerHTML = formatter.format(mealCost * 0.10);
        document.getElementById('tip15').innerHTML = formatter.format(mealCost * 0.15);
        document.getElementById('tip18').innerHTML = formatter.format(mealCost * 0.18);
        document.getElementById('tip20').innerHTML = formatter.format(mealCost * 0.20);
        document.getElementById('tip22').innerHTML = formatter.format(mealCost * 0.22);
    }

    function doInstall() {
        console.log('doInstall');
        // We've tapped the install button, so hide it
        installButton.style.display = 'none';
        // execute the deferred installation prompt
        deferredPrompt.prompt();
        // Wait for the response from the deferred prompt
        deferredPrompt.userChoice.then((res) => {
            // did the user approve installation?
            if (res.outcome === 'accepted') {
                console.log('doInstall: accepted');
            } else {
                console.log('doInstall: declined');
            }
            // Clear the deferred prompt object so we can only do this once
            deferredPrompt = null;
        });
    }

    // Register the event listener for the input field
    document.getElementById('mealCost').oninput = updateTipAmounts;

    // did we launch as a PWA?
    var urlParams = new URLSearchParams(window.location.search);
    // look for the source parameter, if it's `pwa` then it's installed
    if (urlParams.get('source') === 'pwa') {
        console.log('Launched as PWA');
        // Add the PWA moniker to the title
        let theTitle = document.getElementById('title');        
        theTitle.innerHTML = theTitle.innerHTML + ' (PWA)';
    }

    // Get a handle to the install button
    let installButton = document.getElementById('installButton');
    // Now set the click handler for the install button
    installButton.onclick = doInstall;

    // Create an object we'll use to hold the reference to the PWA install
    // event
    let deferredPrompt;

    // Now add an event listener to respond to the event. Right before the browser
    // installs the PWA, it fires the beforeinstallprompt event. Here, we'll manage
    // the installation ourselves
    window.addEventListener('beforeinstallprompt', (event) => {
        console.log('Event: beforeinstallprompt')
        // don't allow the browser to do its install, we want to do it when the user
        // taps our install button
        event.preventDefault();
        // stash the event object so we can use it later (when the user taps the 
        // install button)
        deferredPrompt = event;
        // Now unhide the Install button so the user can tap it!
        installButton.style.display = 'block';
    });

    // Register an event listener for after the app installs
    window.addEventListener('appinstalled', (event) => {
        console.log('App Installed');
    });


})();

