// IndexedDB DB and Store Properties
const DB_NAME = 'pwa-news';
const DB_VERSION = 1;
const STORE_NAME = 'feedback';

function openIDB() {
  console.log('openIDB()');
  // open the indexedDB database used by the app
  return new Promise((resolve, reject) => {
    // open the feedback database
    let theDB = self.indexedDB.open(DB_NAME, DB_VERSION);

    // success callback
    theDB.onsuccess = function (event) {
      console.log('openIDB: Successfully opened database');
      // success, return the db object result
      resolve(event.target.result);
    };

    // define the database error callback
    theDB.onerror = function (event) {
      let msg = `Database error ${theDB.error}`;
      console.error(`openIDB: ${msg}`);
      Swal.fire('Database Error', msg, 'error');
      // reject the promise, we failed
      // include the error message with the failure
      reject(msg);
    };

    theDB.onupgradeneeded = function (event) {
      console.log('openIDB: Database upgrade needed');
      // get a handle to the database
      var db = event.target.result;
      // does the store already exist?
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // no? Then create it
        console.log(`openIDB: Creating store ${STORE_NAME}`);
        // first create the configuration options for the store
        var storeOptions = { keyPath: "idx", autoIncrement: true };
        // then create the store
        var theStore = db.createObjectStore(STORE_NAME, storeOptions);
      };
    };
  });
};

function queueFeedback(db, feedback) {
  console.log('queueFeedback()');
  return new Promise((resolve, reject) => {
    let request = db.transaction([STORE_NAME], "readwrite")
      .objectStore(STORE_NAME)
      .add({ timestamp: Date.now(), sentiment: feedback });

    request.onsuccess = function (event) {
      console.log('queueFeedback: Successfully added feedback');
      navigator.serviceWorker.ready.then(reg => {
        console.log('queueFeedback: Registering sync event');
        // fire off the sync request
        // to the service worker
        reg.sync.register('feedback')
          .then(() => {
            // tell the user
            Swal.fire({
              type: 'info',
              title: 'Request Queued',
              text: 'Your sentiment rating was queued for ' +
                'submission to the server.',
              footer: 'Please refresh the page.',
            });
            // and resolve the promise
            resolve();
          })
          .catch(() => {
            // I can't think of why this would happen            
            reject();
          })

      });
    };

    request.onerror = function (event) {
      // unable to create transaction
      reject(db.error);
    };
  });
};

function getFeedbackItems() {
  console.log('DB: getFeedbackItems()');

  // will hold the array of feedback items
  let items = [];

  return new Promise((resolve, reject) => {
    // yes, save the feedback to the database
    openIDB()
      .then(db => {
        let request = db.transaction([STORE_NAME], "readonly")
          .objectStore(STORE_NAME)
          .openCursor();

        // success!
        request.onsuccess = function (event) {
          // get a handle to the cursor
          var cursor = event.target.result;
          // do we have a valid cursor?
          if (cursor) {
            // add the feedback item to the array
            items.push(cursor.value);
            // move onto the next item in the object store
            cursor.continue();
          } else {
            // no valid cursor, so must be at the end
            resolve({ db: db, items: items });
          }
        };

        // ugh, error
        request.onerror = function (event) {
          console.error(request.error);
          reject(request.error);
        }
      })  // openIDB()
      .catch((error) => {
        console.error(request.error);
        reject(request.error);
      }); // openIDB()
  });
};

function deleteFeedback(db, idx) {
  console.log(`DB: deleteFeedback: Processing index ${idx}`);

  return new Promise((resolve, reject) => {
    // create a transaction
    let request = db.transaction([STORE_NAME], "readwrite")
      .objectStore(STORE_NAME)
      .delete(idx);

    // success!
    request.onsuccess = function (event) {
      console.log(`DB: deleteFeedback: Item ${idx} deleted`);
      resolve(idx);
    }

    // ugh, error
    request.onerror = function (event) {
      console.log(`DB: deleteFeedback: Unable to delete item ${idx}`);
      console.error(transaction.error);
      reject(transaction.error);
    }
  });
};
