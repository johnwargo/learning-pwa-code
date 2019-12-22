// @ts-check

(function () {
    var lastUpdated;

    var updateAgo = function () {
        // updates the last Updated time with a timer value
        document.getElementById('updatedAgo').textContent =
            `(${moment(lastUpdated).from(Date.now())})`;
    };

    /**
     * @param {*} theData 
     */
    function renderNewsData(theData) {
        console.log('Rendering News data');
        let outHTML;
        // do we have data to process?
        if (theData.items.length > 0) {
            // yes! so start building our output HTML
            outHTML = '<article><ul class="items news">';
            // iterate through the news items
            for (let idx in theData.items) {
                // get the current item
                let item = theData.items[idx];
                // build an HTML LI for the item
                outHTML += `<li class='newsItem'>`;
                outHTML += `<div class='imgContainer'>`;
                if (item.image) {
                    outHTML += `<img class="newsItemImage" src="${item.image.url}" title="${item.name}" />`;
                };
                outHTML += `</div><div class='contentContainer'>`;
                outHTML += `<h4><a href="${item.url}" target="_blank">${item.name}</a></h4>`;
                outHTML += `<p>${item.description}</p>`;
                outHTML += `<p class='publishInfo'><span class='label'>Published:</span><span class='text'>${moment(item.published).format("MMMM Do YYYY")}</span></p>`;
                if (item.provider) {
                    outHTML += `<p class='providerInfo'><span class='label'>${item.provider.type}:</span><span class='text'>${item.provider.name}</span></p>`;
                }
                outHTML += '</div></li>';
            }
            outHTML += '</ul>';
        } else {
            outHTML = '<article><p class="noData">No data available, what\'s up with that?</p>';
        }
        outHTML += '</article>';
        // write the content to the page
        document.querySelector('#newsContent').innerHTML = outHTML;

        // store the last updated time in this global variable
        // so the timer function has access to it later
        lastUpdated = theData.lastUpdated;
        // update the last updated area at the top
        document.getElementById('lastUpdated').textContent = moment(lastUpdated).format("MMMM D, h:mm A");
        // update the `Ago` part of the last updated
        updateAgo();
        // then set a timer to update the Ago part every second
        setInterval(updateAgo, 1000);
    }

    function setPresence(dataSource, dataState) {
        // set the data source element in the footer
        document.getElementById('sourceValue').textContent = dataSource;
        // set the data state element in the footer 
        document.getElementById('dataStateValue').textContent = dataState;
    }

    function logError(msg, updatePage = false) {
        console.error(msg);
        if (updatePage) {
            document.getElementById('newsContent').innerHTML = msg;
        }
        // display a warning dialog (using Sweet Alert 2)
        Swal.fire('Data Error', msg, 'error');
    }


    function getNewsData() {
        console.log('getNewsData()');
        // build the URL to the app's APIs
        const serverUrl = `${location.origin}/api/news`;
        // tell the developer what we're doing
        console.log(`Getting data from ${serverUrl}`);
        // update the page so the user knows
        document.getElementById('newsContent').innerHTML = 'Retrieving data...';
        // get the data from the network
        fetch(serverUrl)
            .then(res => {
                console.log('Received response from the server');
                // did the request succeed?
                if (res.status !== 200) {
                    logError(`Unable to access server (error: ${res.status} - ${res.statusText})`, true);
                    // Exit
                    return;
                }
                // alright, so we have data, lets process it
                res.json()
                    .then(newsObject => {
                        // do we have data to work with? 
                        if (newsObject) {
                            console.log('Received data from the server');
                            // update the Source and data state values in the footer
                            // newobject.status tells where the server process got the data
                            // fresh, cached, error
                            setPresence(DATA_SOURCES[0], DATA_STATES[newsObject.status - 1]);
                            // update the page with the new data
                            renderNewsData(newsObject);
                        } else {
                            // update the Source and data state values in the footer
                            setPresence(DATA_SOURCES[3], DATA_STATES[2]);
                            logError('Error fetching data (News Object empty)', true);
                        }
                    })
                    .catch(error => {
                        // update the Source and data state values in the footer
                        setPresence(DATA_SOURCES[3], DATA_STATES[2]);
                        logError(error.message);
                    });
            })
            .catch(error => {
                // update the Source and data state values in the footer
                setPresence(DATA_SOURCES[3], DATA_STATES[2]);
                logError(`Error fetching data: ${error}`, true);
            });
    }

    // set the data state footer value to UNKNOWN until we check for data
    // document.getElementById('dataStateValue').textContent = STATUS_UNKNOWN;
    // get the data for the page
    getNewsData();

})();
