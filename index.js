const rimraf = require('rimraf');
const fs = require('fs');
const request = require('request-promise-native');
const CONFIG = require('./config');
const _ = require('lodash')
const imageUrls = require('./imageUrls.json');
const DOWNLOAD_FOLDER = 'dist';


async function clearDownloadFolder() {
    return new Promise(resolve => {
        if (!fs.existsSync(DOWNLOAD_FOLDER)) {
            fs.mkdirSync(DOWNLOAD_FOLDER);
        }

        rimraf(`${CONFIG.ROOT_DIR}/${DOWNLOAD_FOLDER}/*`, () => {
            console.log('Cleared dist folder.');
            resolve();
        });
    });
}

function getFileNameFromUrl(url) {
    return url.substring(url.lastIndexOf('/') + 1);
}

function downloadImages(imageUrls) {
    async function runPromisesInSequence() {
        for (let imageUrl of imageUrls) {
            const fileName = getFileNameFromUrl(imageUrl);
            await request(imageUrl, {encoding: 'binary'}).then( response => {
                console.log(`${imageUrl} - loaded`)
                return writeToFile(fileName, response)
            })
        }
    }

    return runPromisesInSequence()
}

function writeToFile(fileName, fileContent) {
    return fs.writeFileSync(`${DOWNLOAD_FOLDER}/${fileName}`, fileContent, 'binary');
}

function start() {
    const uniqImageUrls = _.uniq(imageUrls);
    console.log(imageUrls.length);
    console.log(uniqImageUrls.length);

    clearDownloadFolder()
        .then( downloadImages(uniqImageUrls) );
}

start();