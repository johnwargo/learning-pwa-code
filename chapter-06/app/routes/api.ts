const express = require('express');
const router = express.Router();

// https://www.npmjs.com/package/node-persist
const storage = require('node-persist');
// https://www.npmjs.com/package/uuid
const uuidv1 = require('uuid/v1');
// https://www.npmjs.com/package/web-push
const webpush = require('web-push');

import { Config } from '../config';
import { Browser } from '../interfaces';

const STORAGE_KEY: string = 'browsers';

// Initialize the storage module
storage.init({ dir: './subscriptions' }).then(() => {
  console.log('Storage initialized');
  storage.getItem(STORAGE_KEY)
    .then((theResult: any) => {
      // show how many records we have
      let browsers = theResult ? theResult : [];
      console.log(`Store contains ${browsers.length} records`);
    })
});

// Initialize the Web Push Module
// borrowed from https://www.npmjs.com/package/web-push
if (Config.GCMAPI_KEY) {
  // If we have a GCM key, use it
  webpush.setGCMAPIKey(Config.GCMAPI_KEY);
  /* In an early implementation of Push (in 2014)
     Google used Google Cloud Messaging (GCM)
     before any standards were in place. So
     If you're supporting users running 
     really old browsers, then you'll want to 
     populate this value in the config file */
}
webpush.setVapidDetails(
  'mailto:john@johnwargo.com',
  Config.VAPID_PUBLIC,
  Config.VAPID_PRIVATE
);

function generateIdx(browsers: any[]): number {
  // Return the next idx value    
  // assumes the array is sorted by idx
  const len = browsers.length;
  if (len < 1) {
    return 1;
  } else {
    // Grab the last idx and increment it by 1
    let lastItem = browsers[len - 1].idx;
    if (lastItem) {
      return lastItem + 1;
    } else {
      return 1;
    }
  }
}

router.post('/send/:idx', function (req: any, res: any, next: any) {
  // Send a notification message
  console.log('Router: POST /send');
  const pushBody = JSON.stringify(req.body);
  // convert the parameter to a number
  let idx = parseInt(req.params.idx, 10);
  // do we have a number in idx?
  if (idx && pushBody) {
    console.log(`Sending notification to Idx: ${idx}`);
    console.log(`Payload: ${pushBody}`);

    storage.getItem(STORAGE_KEY)
      .then((theResult: any) => {
        let browsers = theResult ? theResult : [];
        // get the item from the array at idx
        let index = browsers.findIndex(function (subscription: any) {
          return subscription.idx === idx;
        });
        // did we find it?
        if (index > -1) {
          // get the subscriber
          let browser = browsers[index];
          webpush.sendNotification(browser.subscription, pushBody, {})
            .then((result: any) => {
              console.log('Notification sent successfully');
              res.json(result);
            })
            .catch((result: any) => {
              console.log('Notification failure');
              console.log(result);
              // Does the response have an error code?
              if (result.statusCode) {
                // Then return it to the calling application
                res.status(result.statusCode).send({ msg: result.body });
              } else {
                // Otherwise who knows?
                res.status(500).send(result);
              }
            })
        } else {
          console.log('Browser not found');
          res.sendStatus(404);
        }
      })
      .catch((error: any) => {
        console.log(error);
        res.sendStatus(500);
      })
  } else {
    res.sendStatus(400);
  }
});

router.post('/subscribe', function (req: any, res: any, next: any) {
  // Register a subscription
  console.log('Router: POST /subscription');
  // get the current subscriptions list from the store    
  storage.getItem(STORAGE_KEY)
    .then((theResult: any[]) => {
      // get the subscriptions array
      let browsers = theResult ? theResult : [];
      let idx = generateIdx(browsers);
      let uuid = uuidv1();
      // pull the data off of the request
      let data = req.body;
      let browser: Browser = {
        idx: idx,
        // name: `Subscription #${idx}`,
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
        .then(() => {
          // res.sendStatus(201);
          res.status(201).send({ uuid: uuid });
        })
        .catch((error: any) => {
          console.log(error);
          res.sendStatus(500);
        })
    })
    .catch((error: any) => {
      console.log(error);
      res.sendStatus(500);
    })
});

router.get('/subscription/:idx', function (req: any, res: any, next: any) {
  // Get details for a specific subscription
  console.log('Router: GET /subscription');
  // convert the parameter to a number
  let idx = parseInt(req.params.idx, 10);
  // do we have a number in idx?
  if (idx) {
    storage.getItem(STORAGE_KEY)
      .then((theResult: any) => {
        let browsers = theResult ? theResult : [];
        // get the item from the array at idx
        let browser = browsers.find(function (subscription: any) {
          return subscription.idx === idx;
        });
        if (browser) {
          res.json(browser);
        } else {
          res.sendStatus(404);
        }
      })
      .catch((error: any) => {
        console.log(error);
        res.sendStatus(500);
      })
  } else {
    res.sendStatus(400);
  }
});

router.delete('/subscription/:idx', function (req: any, res: any, next: any) {
  // Delete a specific subscription
  console.log('Router: DELETE /subscription');
  // convert the parameter to a number
  let idx = parseInt(req.params.idx, 10);
  console.log(`Index: ${idx}`);
  // do we have a number in idx?
  if (idx) {
    storage.getItem(STORAGE_KEY)
      .then((theResult: any) => {
        let browsers = theResult ? theResult : [];
        // get the item from the array at idx
        let index = browsers.findIndex(function (browser: any) {
          return browser.idx === idx;
        });
        // did we find it?
        if (index > -1) {
          // whack it from the array
          browsers.splice(index, 1);
          // save the data
          storage.setItem(STORAGE_KEY, browsers)
            .then(() => {
              res.sendStatus(200);
            })
            .catch((error: any) => {
              console.log(error);
              res.sendStatus(500);
            })
        } else {
          res.sendStatus(404);
        }
      })
      .catch((error: any) => {
        console.log(error);
        res.sendStatus(500);
      })
  } else {
    res.sendStatus(400);
  }
});

router.put('/subscription/:idx', function (req: any, res: any, next: any) {
  // Update the name for a subscription
  // convert the parameter to a number
  let idx = parseInt(req.params.idx, 10);
  console.log(`Router: PUT /subscription/${idx}`);
  let name = req.body.name;
  // do we have the values we need??
  if ((idx) && (name)) {
    console.log(`Updating Name at ${idx} to ${name}`);
    // get the subscriptions list
    storage.getItem(STORAGE_KEY)
      .then((theResult: any) => {
        let browsers = theResult ? theResult : [];
        // find the array index for idx
        let index = browsers.findIndex(function (browser: any) {
          return browser.idx === idx;
        });
        console.log(index);
        // did we find it?
        if (index > -1) {
          // update the name value in the selected object
          browsers[index].name = name;
          // save the data
          storage.setItem(STORAGE_KEY, browsers)
            .then(() => {
              res.sendStatus(200);
            })
            .catch((error: any) => {
              console.log(error);
              res.sendStatus(500);
            })
        } else {
          res.sendStatus(404);
        }
      })
      .catch((error: any) => {
        console.log(error);
        res.sendStatus(500);
      })
  } else {
    console.log('Missing parameter');
    res.sendStatus(400);
  }
});

router.get('/subscriptions', function (req: any, res: any, next: any) {
  console.log('Router: GET /subscriptions');
  storage.getItem(STORAGE_KEY)
    .then((theResult: any) => {
      res.json(theResult ? theResult : []);
    })
    .catch((error: any) => {
      console.log(error);
      res.sendStatus(404);
    })
});

router.post('/unsubscribe/:uuid', function (req: any, res: any, next: any) {
  console.log('Router: GET /unsubscribe');
  // get the UUID from the query
  let uuid = req.params.uuid
  // do we have one?
  if (uuid) {
    // yes? get started
    console.log(`Unsubscribing UUID: ${uuid}`);
    storage.getItem(STORAGE_KEY)
      .then((theResult: any) => {
        let browsers = theResult ? theResult : [];
        // get the item from the array at idx
        let index = browsers.findIndex(function (browser: any) {
          return browser.uuid === uuid;
        });
        // did we find it?
        if (index > -1) {
          // whack it from the array
          browsers.splice(index, 1);
          // save the data
          storage.setItem(STORAGE_KEY, browsers)
            .then(() => {
              res.sendStatus(200);
            })
            .catch((error: any) => {
              console.log(error);
              res.sendStatus(500);
            })
        } else {
          res.sendStatus(404);
        }
      })
      .catch((error: any) => {
        console.log(error);
        res.sendStatus(500);
      })
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;
