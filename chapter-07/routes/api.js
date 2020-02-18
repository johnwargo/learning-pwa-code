"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var router = express.Router();
// https://www.npmjs.com/package/node-persist
var storage = require('node-persist');
// https://www.npmjs.com/package/uuid
var uuidv1 = require('uuid/v1');
// https://www.npmjs.com/package/web-push
var webpush = require('web-push');
var config_1 = require("../config");
var STORAGE_KEY = 'browsers';
// initialize the storage module
storage.init({ dir: './subscriptions' }).then(function () {
    console.log('Storage initialized');
    storage.getItem(STORAGE_KEY)
        .then(function (theResult) {
        // show how many records we have
        var browsers = theResult ? theResult : [];
        console.log("Store contains " + browsers.length + " records");
    });
});
// initialize the Web Push Module
// borrowed from https://www.npmjs.com/package/web-push
if (config_1.Config.GCMAPI_KEY) {
    // if we have a GCM key, use it
    webpush.setGCMAPIKey(config_1.Config.GCMAPI_KEY);
    /* in an early implementation of Push (in 2014)
       Google used Google Cloud Messaging (GCM)
       before any standards were in place. So
       if you're supporting users running
       really old browsers, then you'll want to
       populate this value in the config file */
}
webpush.setVapidDetails('mailto:john@johnwargo.com', config_1.Config.VAPID_PUBLIC, config_1.Config.VAPID_PRIVATE);
function generateIdx(browsers) {
    // return the next idx value    
    // assumes the array is sorted by idx
    var len = browsers.length;
    if (len < 1) {
        return 1;
    }
    else {
        // grab the last idx and increment it by 1
        var lastItem = browsers[len - 1].idx;
        if (lastItem) {
            return lastItem + 1;
        }
        else {
            return 1;
        }
    }
}
router.post('/send/:idx', function (req, res, next) {
    // send a notification message
    console.log('Router: POST /send');
    var pushBody = JSON.stringify(req.body);
    // convert the parameter to a number
    var idx = parseInt(req.params.idx, 10);
    // do we have a number in idx?
    if (idx && pushBody) {
        console.log("Sending notification to Idx: " + idx);
        console.log("Payload: " + pushBody);
        storage.getItem(STORAGE_KEY)
            .then(function (theResult) {
            var browsers = theResult ? theResult : [];
            // get the item from the array at idx
            var index = browsers.findIndex(function (subscription) {
                return subscription.idx === idx;
            });
            // did we find it?
            if (index > -1) {
                // get the subscriber
                var browser = browsers[index];
                webpush.sendNotification(browser.subscription, pushBody, {})
                    .then(function (result) {
                    console.log('Notification sent successfully');
                    res.json(result);
                })
                    .catch(function (result) {
                    console.log('Notification failure');
                    console.log(result);
                    // does the response have an error code?
                    if (result.statusCode) {
                        // then return it to the calling application
                        res.status(result.statusCode).send({ msg: result.body });
                    }
                    else {
                        // otherwise who knows?
                        res.status(500).send(result);
                    }
                });
            }
            else {
                console.log('Browser not found');
                res.sendStatus(404);
            }
        })
            .catch(function (error) {
            console.log(error);
            res.sendStatus(500);
        });
    }
    else {
        res.sendStatus(400);
    }
});
router.post('/subscribe', function (req, res, next) {
    // register a subscription
    console.log('Router: POST /subscription');
    // get the current subscriptions list from the store    
    storage.getItem(STORAGE_KEY)
        .then(function (theResult) {
        // get the subscriptions array
        var browsers = theResult ? theResult : [];
        var idx = generateIdx(browsers);
        var uuid = uuidv1();
        // pull the data off of the request
        var data = req.body;
        var browser = {
            idx: idx,
            uuid: uuid,
            name: data.name,
            subscription: data.subscription,
            platformName: data.platformName,
            platformVersion: data.platformVersion,
            platformLayout: data.platformLayout,
            platformOS: data.platformOS,
            platformDesc: data.platformDesc,
            subscribed: Date.now(),
        };
        // add the new value to the array
        browsers.push(browser);
        // write the array out to storage
        storage.setItem(STORAGE_KEY, browsers)
            .then(function () {
            // res.sendStatus(201);
            res.status(201).send({ uuid: uuid });
        })
            .catch(function (error) {
            console.log(error);
            res.sendStatus(500);
        });
    })
        .catch(function (error) {
        console.log(error);
        res.sendStatus(500);
    });
});
router.get('/subscription/:idx', function (req, res, next) {
    // get details for a specific subscription
    console.log('Router: GET /subscription');
    // convert the parameter to a number
    var idx = parseInt(req.params.idx, 10);
    // do we have a number in idx?
    if (idx) {
        storage.getItem(STORAGE_KEY)
            .then(function (theResult) {
            var browsers = theResult ? theResult : [];
            // get the item from the array at idx
            var browser = browsers.find(function (subscription) {
                return subscription.idx === idx;
            });
            if (browser) {
                res.json(browser);
            }
            else {
                res.sendStatus(404);
            }
        })
            .catch(function (error) {
            console.log(error);
            res.sendStatus(500);
        });
    }
    else {
        res.sendStatus(400);
    }
});
router.delete('/subscription/:idx', function (req, res, next) {
    // delete a specific subscription
    console.log('Router: DELETE /subscription');
    // convert the parameter to a number
    var idx = parseInt(req.params.idx, 10);
    console.log("Index: " + idx);
    // do we have a number in idx?
    if (idx) {
        storage.getItem(STORAGE_KEY)
            .then(function (theResult) {
            var browsers = theResult ? theResult : [];
            // get the item from the array at idx
            var index = browsers.findIndex(function (browser) {
                return browser.idx === idx;
            });
            // did we find it?
            if (index > -1) {
                // whack it from the array
                browsers.splice(index, 1);
                // save the data
                storage.setItem(STORAGE_KEY, browsers)
                    .then(function () {
                    res.sendStatus(200);
                })
                    .catch(function (error) {
                    console.log(error);
                    res.sendStatus(500);
                });
            }
            else {
                res.sendStatus(404);
            }
        })
            .catch(function (error) {
            console.log(error);
            res.sendStatus(500);
        });
    }
    else {
        res.sendStatus(400);
    }
});
router.put('/subscription/:idx', function (req, res, next) {
    // Update the name for a subscription
    // convert the parameter to a number
    var idx = parseInt(req.params.idx, 10);
    console.log("Router: PUT /subscription/" + idx);
    var name = req.body.name;
    // do we have the values we need??
    if ((idx) && (name)) {
        console.log("Updating Name at " + idx + " to " + name);
        // get the subscriptions list
        storage.getItem(STORAGE_KEY)
            .then(function (theResult) {
            var browsers = theResult ? theResult : [];
            // find the array index for idx
            var index = browsers.findIndex(function (browser) {
                return browser.idx === idx;
            });
            console.log(index);
            // did we find it?
            if (index > -1) {
                // update the name value in the selected object
                browsers[index].name = name;
                // save the data
                storage.setItem(STORAGE_KEY, browsers)
                    .then(function () {
                    res.sendStatus(200);
                })
                    .catch(function (error) {
                    console.log(error);
                    res.sendStatus(500);
                });
            }
            else {
                res.sendStatus(404);
            }
        })
            .catch(function (error) {
            console.log(error);
            res.sendStatus(500);
        });
    }
    else {
        console.log('Missing parameter');
        res.sendStatus(400);
    }
});
router.get('/subscriptions', function (req, res, next) {
    console.log('Router: GET /subscriptions');
    storage.getItem(STORAGE_KEY)
        .then(function (theResult) {
        res.json(theResult ? theResult : []);
    })
        .catch(function (error) {
        console.log(error);
        res.sendStatus(404);
    });
});
router.post('/unsubscribe/:uuid', function (req, res, next) {
    console.log('Router: GET /unsubscribe');
    // get the UUID from the query
    var uuid = req.params.uuid;
    // do we have one?
    if (uuid) {
        // yes? get started
        console.log("Unsubscribing UUID: " + uuid);
        storage.getItem(STORAGE_KEY)
            .then(function (theResult) {
            var browsers = theResult ? theResult : [];
            // get the item from the array at idx
            var index = browsers.findIndex(function (browser) {
                return browser.uuid === uuid;
            });
            // did we find it?
            if (index > -1) {
                // whack it from the array
                browsers.splice(index, 1);
                // save the data
                storage.setItem(STORAGE_KEY, browsers)
                    .then(function () {
                    res.sendStatus(200);
                })
                    .catch(function (error) {
                    console.log(error);
                    res.sendStatus(500);
                });
            }
            else {
                res.sendStatus(404);
            }
        })
            .catch(function (error) {
            console.log(error);
            res.sendStatus(500);
        });
    }
    else {
        res.sendStatus(400);
    }
});
module.exports = router;
