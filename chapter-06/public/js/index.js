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

}

function doUnsubscribe() {

}

// set the click event for the `Subscribe` button
document.getElementById("btnSubscribe").addEventListener("click", doSubscribe);
document.getElementById("btnUnsubscribe").addEventListener("click", doUnsubscribe);

// update the UI based on current subscription status
updateUI();
