const webpush = require('web-push');
const fs = require('fs')

const configFilePath1 = './app/config.ts';
const configFilePath2 = './public/js/config.js';

// does the file exist?
try {
  if (!fs.existsSync(configFilePath1) && !fs.existsSync(configFilePath2)) {
    // Generate our keys
    const vapidKeys = webpush.generateVAPIDKeys();

    // Write them to the console
    let publicKey = vapidKeys.publicKey;
    console.log(`Public key: ${publicKey}`);
    let privateKey = vapidKeys.privateKey;
    console.log(`Private key: ${privateKey}`);

    // Now create the project's config files
    console.log(`Writing to ${configFilePath1}`);
    var ws1 = fs.createWriteStream(configFilePath1);
    ws1.write('export const Config = {\n')
    ws1.write(`  GCMAPI_KEY: '',\n`);
    ws1.write(`  VAPID_PUBLIC: '${publicKey}',\n`);
    ws1.write(`  VAPID_PRIVATE: '${privateKey}'\n`);
    ws1.write('};\n');
    console.log('Closing file');
    ws1.end();

    console.log(`Writing to ${configFilePath2}`);
    var ws2 = fs.createWriteStream(configFilePath2);
    ws2.write('const Config = {\n')
    ws2.write(`  VAPID_PUBLIC: '${publicKey}'\n`);
    ws2.write('};\n');
    console.log('Closing file');
    ws2.end();

  } else {
    console.warn(`\nThe files '${configFilePath1}' or '${configFilePath2}' already exist`);
    console.warn(`Please delete the file(s) and try again`);
  }
} catch (err) {
  console.error(err)
  process.exit(1);
}
