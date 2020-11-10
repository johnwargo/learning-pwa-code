https://docs.microsoft.com/en-us/bing/search-apis/bing-web-search/quickstarts/rest/nodejs

const axios = require('axios').default;
const express = require('express');

var router = express.Router();

import { Image, News, Provider, UserSentiment } from '../interfaces';
import { StatusCode } from '../enums';
import { Config } from '../config';

const BING_KEY = Config.BING_ACCESS_KEY;
const BING_HOST = "https://api.bing.microsoft.com/v7.0/news/search";  // News
// const BING_HOST = "https://api.bing.microsoft.com/v7.0/search";    // General search
const BING_MARKET = 'en-US';
const SEARCH_QUERY = 'pwa,progressive web apps';

// how frequently the cache refreshes
const CACHE_DURATION: number = 15; // minutes
// Used in delta calculations (current time with last checked time)
const CACHE_DURATION_MS: number = CACHE_DURATION * 60000; // milliseconds
// password required when clearing cache via the API
const RESET_KEY: string = 'hjksdghsi28dhw7209i';    // just some random string
// Start at 0, but will be millisecond time later as the cache's refreshed
var cacheTime: number = 0;
// Create the array that will hold the news data
var _newsArray: News[] = [];

// local user sentiment object, populate it with random good stuff on init
var _userSentiment: UserSentiment = {
  amazing: getRandomInt(10000),
  awesome: getRandomInt(5000),
  fantastic: getRandomInt(5000),
  great: getRandomInt(1000),
  ok: 1,
  perfect: getRandomInt(10000)
};

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

function clone(obj: any): any {
  let copy;
  // Handle the 3 simple types, and null or undefined
  if (null == obj || 'object' !== typeof obj) {
    return obj;
  }
  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }
  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }
  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (let attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        // @ts-ignore
        copy[attr] = clone(obj[attr]);
      }
    }
    return copy;
  }
  throw new Error('Unable to copy object, type not supported.');
}

router.get('/news', function (req: any, res: any, next: any) {
  console.log('Router: GET /api/news');

  // our local results array
  var resArray: News[] = [];
  var lastUpdated: number = Date.now();
  var statusCode: StatusCode;

  // Set the result header
  res.set('Cache-Control', 'max-age=5');

  // Check for news articles if we have no cached data or if it's been more
  // than CACHE_DURATION since we last checked
  if (_newsArray.length < 1 || Date.now() - cacheTime > CACHE_DURATION_MS) {
    console.log('Requesting data from Bing');

    let request_uri = `${BING_HOST}?q=${encodeURI(SEARCH_QUERY)}&count=20&offset=0`;
    console.log(`Request URI: ${request_uri}`)

    let request_params = {
      method: 'GET',
      url: request_uri,
      headers: { 'Ocp-Apim-Subscription-Key': BING_KEY },
      json: true
    };
    // console.dir(request_params);
    // Call the REST API with our parameters
    axios(request_params)
      // handle success
      .then((response: Response) => {
        //@ts-ignore   
        console.log('statusCode:', response && response.status);
        console.dir(response);

        // empty out the results array
        let resArray: News[] = [];
        // grab the value object
        //@ts-ignore   
        var items = response.data.value;
        // start looping through the results
        for (var idx in items) {
          // Create a new item
          let newItem: any = {};
          // Assign it some properties from the results
          newItem.type = items[idx]._type;
          newItem.name = items[idx].name;
          newItem.description = items[idx].description;
          newItem.url = items[idx].url;
          newItem.published = items[idx].datePublished;
          newItem.category = items[idx].category;
          // does it have an Image object?
          if (items[idx].image) {
            // create a new Image object
            let image: Image = {
              type: (items[idx].image.thumbnail._type ? items[idx].image.thumbnail._type : ''),
              url: (items[idx].image.thumbnail.contentUrl ? items[idx].image.thumbnail.contentUrl : ''),
              width: (items[idx].image.thumbnail.contentUrl ? items[idx].image.thumbnail.width : 0),
              height: (items[idx].image.thumbnail.contentUrl ? items[idx].image.thumbnail.height : 0),
            }
            // Add it to the newItem
            newItem.image = image;
          }
          // Does it have a Provider object?
          if (items[idx].provider[0]) {
            // create a new image object
            let provider: Provider = {
              type: (items[idx].provider[0]._type ? items[idx].provider[0]._type : ''),
              name: (items[idx].provider[0].name ? items[idx].provider[0].name : '')
            }
            // Add it to the newItem
            newItem.provider = provider;
          }
          // Save the new item to the array
          resArray.push(newItem);
        }
        if (resArray.length > 0) {
          // We have data, so we've got a 'new' set of results
          statusCode = StatusCode.New;
          // Reset our cache time for next iteration
          cacheTime = Date.now();
          // Set the retrieval time
          lastUpdated = Date.now();
          // store those results in our local 'cache'
          _newsArray = clone(resArray);
        } else {
          // do we have cached data?
          if (_newsArray.length > 0) {
            console.log('We have cached results');
            statusCode = StatusCode.Cache;
            lastUpdated = cacheTime;
            resArray = clone(_newsArray);
          } else {
            console.log('We have no results');
            statusCode = StatusCode.Error;
            lastUpdated = Date.now();
            resArray = [];
          }
        }
        // return the result
        console.log(`Returning result (${statusCode})`);
        res.json({
          status: statusCode,
          lastUpdated: lastUpdated,
          items: resArray
        });


      })
      // handle error
      .catch((error: Error) => {
        console.log('Caught error');
        console.error(error);
        // do we have cached data?
        if (_newsArray.length > 0) {
          statusCode = StatusCode.Cache;
          lastUpdated = cacheTime;
          resArray = clone(_newsArray);
        } else {
          statusCode = StatusCode.Error;
          lastUpdated = Date.now();
          resArray = [];
        }
        // return the result
        console.log(`Returning catch result (${statusCode})`);
        res.json({
          status: statusCode,
          lastUpdated: lastUpdated,
          items: resArray
        });
      });

  } else {
    // Using cached data
    console.log(`Returning cached result (${StatusCode.Cache})`);
    res.json({
      status: StatusCode.Cache,
      lastUpdated: cacheTime,
      items: _newsArray
    });
  }
});

router.delete('/news', function (req: any, res: any, next: any) {
  console.log('Router: DELETE /api/news');
  // Clear the news article cache timer (forces retrieve from bing
  if (req.body.pswd === RESET_KEY) {
    console.log('Deleting news cache');
    _newsArray = [];
    res.sendStatus(201);
  } else {
    console.log('Invalid request');
    res.sendStatus(400);
  }
});

router.get('/sentiment', function (req: any, res: any, next: any) {
  console.log('Router: GET /api/sentiment');
  // Set the result header
  res.set('Cache-Control', 'max-age=5');
  // Return the current sentiment object
  res.json(_userSentiment);
});

router.post('/sentiment', function (req: any, res: any, next: any) {
  const _validSentiment: string[] = ['amazing', 'awesome', 'fantastic', 'great', 'ok', 'perfect'];

  console.log('Router: POST /api/sentiment');
  // pull the sentiment from the POST body
  const sentiment: string = req.body.sentiment.toLowerCase();
  // is sentiment valid? (is it in the list?)
  if (_validSentiment.includes(sentiment)) {
    // Then increment the provided sentiment
    console.log(`Incrementing ${sentiment}`);
    // The following code works, but the TypeScript compiler doesn't like it
    // @ts-ignore
    _userSentiment[sentiment] = _userSentiment[sentiment] + 1;
    res.sendStatus(201);
  } else {
    console.log(`Invalid sentiment: ${sentiment}`);
    res.sendStatus(400);
  }
});

module.exports = router;
