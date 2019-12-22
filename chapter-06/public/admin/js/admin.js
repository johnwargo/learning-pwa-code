//@ts-check

var currentBrowser; // used to track which browser called the Notify window.

const sendContent = [
    {
        title: "This is the title",
        body: "This is the message",
        icon: "/img/push-icon-red.png",
    },
    {
        title: "This is the title",
        body: "This is the message",
        icon: "/img/push-icon-transparent-green.png",
        image: "https://picsum.photos/300/100",
    },
    {
        title: "This is the title",
        body: "This is the message",
        icon: "/img/push-icon-transparent-green.png",
        image: "https://picsum.photos/300/100",
        badge: "",
        vibrate: "",
        sound: "",
        dir: "auto",
        tag: "PushAdmin",
        data: {},
        requireInteraction: true,
        renotify: false,
        silent: false,
        actions: [
            { action: "like", title: "Like" },
            { action: "dislike", title: "Dislike" }
        ]
    }
];

function updateBrowserData() {
    console.log('updateBrowserData()');
    const serverUrl = `${location.origin}/api/subscriptions`;
    fetch(serverUrl)
        .then(response => {
            console.log(`updateBrowserData: ${response.status} response`);
            response.json()
                .then((data) => {
                    if (data) {
                        // get rid of any existing list items
                        $("#browserRegistrations").empty();
                        // now look through the data array
                        data.forEach((item) => {
                            let idx = item.idx;
                            let listItem = '<li class="registration"><h4>';
                            listItem += `<button onclick="editTitle(${idx})" id="editButton${idx}" class="browserNameEditButton">${item.name}</button>`;
                            listItem += `<div id='nameEditControls${idx}' class='editControls'>`;
                            listItem += `<input class="browserNameField" id="registration${idx}" name="registration${idx}" value="${item.name}">`;
                            listItem += `<button class="browserSaveBtn" onclick="saveTitleEdit(${idx})">`;
                            listItem += '<i class="fa fa-check"></i></button>';
                            listItem += `<button class="browserCancelBtn" onclick="cancelTitleEdit(${idx})">`;
                            listItem += '<i class="fa fa-close"></i></button></div></h4>';
                            listItem += `<a href='#' class='browserDelete' onclick='removeBrowser(${idx})'></a>`;
                            listItem += `<p>${item.platformDesc}</p>`;
                            listItem += `<button id="notifyBtn${idx}" class="notifyButton" onclick="showNotifyDialog(${idx})">Notify</button>`;
                            listItem += '</li>';
                            $("ul").append(listItem);
                        });
                    } else {
                        console.log('updateBrowserData: No data to process');
                        Swal.fire({
                            type: 'info',
                            title: 'No Subscriptions',
                            text: 'No browsers subscribed through this service.',
                            footer: 'Please subscribe some browsers then try again.',
                            timer: 2000
                        });
                    }
                });
        })
        .catch((error) => {
            console.error(`updateBrowserData: ${error}`);
            Swal.fire('Error', error, 'error');
        })
};

/**
 * 
 * @param {number} idx 
 */
function editTitle(idx) {
    $('#nameEditControls' + idx).show();
    $('#registration' + idx).select();
    $('#editButton' + idx).hide();
}

/**
 * @param {number} idx 
 */
function endTitleEdit(idx) {
    $('#nameEditControls' + idx).hide();
    $('#editButton' + idx).show();
}

/**
 * @param {number} idx 
 */
function saveTitleEdit(idx) {
    // first parameter: array index
    // second parameter: back-end database idx
    let newVal = $('#registration' + idx).val();
    document.querySelector('#editButton' + idx).innerHTML = newVal;
    endTitleEdit(idx);

    const serverUrl = `${location.origin}/api/subscription/${idx}`;
    // build the data object we're sending
    const data = { name: newVal };
    // send it to the server
    fetch(serverUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => {
            console.log(`saveTitleEdit: ${response.status} response`);
            // reload the page (with new data)
            updateBrowserData();
        })
        .catch((error) => {
            console.error(`saveTitleEdit: ${error}`);
            Swal.fire('Error', error, 'error');
        })
}

/**
 * 
 * @param {number} idx 
 */
function cancelTitleEdit(idx) {
    let oldVal = document.querySelector('#editButton' + idx).innerHTML;
    $('#registration' + idx).val(oldVal);
    endTitleEdit(idx);
}

/**
 * @param {number} idx 
 */
function removeBrowser(idx) {
    const serverUrl = `${location.origin}/api/subscription/${idx}`;
    // let deleteIt = confirm(`Permanently delete the connection for ${$('#registration' + num).val()}?`);
    let msg = `Permanently delete the subscription for "${$('#registration' + idx).val()}"?`

    Swal.fire({
        title: 'Delete Browser',
        text: msg,
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.value) {
            fetch(serverUrl, { method: 'DELETE' })
                .then(response => {
                    console.log(`removeBrowser: ${response.status} response`);
                    // reload the page (with new data)
                    updateBrowserData();
                })
                .catch((error) => {
                    console.error(`removeBrowser: ${error}`);
                    Swal.fire('Error', error, 'error');
                })
        }
    })
}

/**
 * @param {number} idx 
 */
function showNotifyDialog(idx) {
    currentBrowser = idx;
    $('#notifyDialog').show();
    console.log('showNotifyDialog(' + currentBrowser + '/' + idx + ')');

}

function hideNotifyDialog() {
    $('#notifyDialog').hide();
}

function resetJSON() {
    console.log('resetJSON()');
    var idx = $("#resetOption").prop('selectedIndex');
    $('#messageJSON').val(JSON.stringify(sendContent[idx], null, '\t'));
}

function sendMessage() {
    console.log('sendMessage(' + currentBrowser + ')');
    const serverUrl = `${location.origin}/api/send/${currentBrowser}`;

    let msg = `Send notification message to ${$('#registration' + currentBrowser).val()}?`;
    // get the content from the page
    let message = $("#messageJSON").val();
    // Can you convert it to JSON?
    if (!message) {
        Swal.fire('Error', 'Invalid message content (JSON), please try again', 'error');
    }

    Swal.fire({
        title: 'Send Notification',
        text: msg,
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.value) {
            // close the dialog, it worked
            hideNotifyDialog();
            // send the message to the server
            fetch(serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: message
            })
                .then(response => {
                    console.log(`sendMessage: ${response.status} response`);
                    response.json()
                        .then(data => {
                            // what response did we get?
                            if (response.status == 200) {
                                // woohoo, it worked!
                                Swal.fire({
                                    type: 'success',
                                    title: 'Notification Sent',
                                    text: 'Successfully sent the notification to the target browser.',
                                    timer: 2000
                                });
                            } else {
                                // ruh roh, didn't work
                                if (data.msg) {
                                    console.log(data.msg);
                                    Swal.fire({
                                        type: 'error',
                                        title: 'Notification Error',
                                        text: `The server returned an error: ${response.status}`,
                                        footer: data.msg
                                    });
                                }
                            }
                        })
                })
                .catch((error) => {
                    console.error(`sendMessage: ${error}`);
                    Swal.fire('Error', error, 'error');
                })
            currentBrowser = '';
        }
    })
}

$(document).ready(function () {
    console.log("ready!");
    // set the default content for the send page    
    var idx = $("#resetOption").prop('selectedIndex');
    $('#messageJSON').val(JSON.stringify(sendContent[idx], null, '\t'));
    updateBrowserData();
});