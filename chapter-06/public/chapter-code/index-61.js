//@ts-check

function updateUI() {
  console.log('updateUI()');
  // does the browser support notification?
  if (("Notification" in window)) {
    document.getElementById("subscribeDiv").style.display = 'block';
  } else {
    // no? Then display a warning
    document.getElementById("noNotificationsWarning").style.display = 'block';
  }
}

function doSubscribe() {
  console.log('subscribe()');
  Notification.requestPermission().then(result => {
    // possible results are: granted, denied, or default
    switch (result) {
      case 'granted':
        // the user gave us permission, 
        // so go ahead and do the registration
        console.log('Granted');

        let theNotification = new Notification('I read Learning PWA, '
          + 'and all I got was this silly notification!');

        theNotification.onclick = function (event) {
          console.log('Notification clicked');
          console.dir(event);
        };

        theNotification.onclose = function (event) {
          console.log('Notification closed');
          console.dir(event);
        }

        theNotification.onerror = function (event) {
          console.error('Notification error');
          console.dir(event);
        }

        theNotification.onshow = function (event) {
          console.log('Notification shown');
          console.dir(event);
        }
    
        break;
      case 'denied':
        // code block
        console.error('Denied');
        Swal.fire({
          type: 'info',
          title: 'Subscribe',
          text: 'You denied access to notifications.',
          footer: 'Please try again when you are ready.'
        });
        break;
      default:
        // the user closed the permissions dialog
        // without making a selection
        console.warn('Default');
        Swal.fire({
          type: 'info',
          title: 'Subscribe',
          text: 'You closed the dialog without making a selection.',
          footer: 'Please try again when you know what you want to do.'
        });
    }
  });
}

function doUnsubscribe() {

}

// set the click event for the `Subscribe` button
document.getElementById("btnSubscribe").addEventListener("click", doSubscribe);
document.getElementById("btnUnsubscribe").addEventListener("click", doUnsubscribe);

// update the UI based on current subscription status
updateUI();