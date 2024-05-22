const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { createZip } = require('./createzip');

const ITEM_ID = 'finlildobfdjhkemcieihnkgmgoikgan';
const CLIENT_ID = '1067014450644-8am6g840s5m9210gei21vuadhpasqlhe.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REFRESH_TOKEN = '1//04LESqHxehJy1CgYIARAAGAQSNwF-L9Ir103l2rvSwSethY5JM7qra7ZSwD9mdFalsFojiNZynCOlrophHxKlomh1Ff3tuQDEDuk';
const EXTENSION_ZIP_PATH = path.resolve(__dirname, 'extension.zip');


async function getAccessToken() {
    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: 'refresh_token',
        });

        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error.response ? error.response.data : error.message);
        throw error;
    }
}


async function checkExtensionStatus(accessToken) {
    try {
        const response = await axios.get(`https://www.googleapis.com/chromewebstore/v1.1/items/${ITEM_ID}?projection=DRAFT`, {
            headers: {

                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log('Extension Status:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error checking extension status:', error.response ? error.response.data : error.message);
        // print the errors
        console.log(error.response.data.error.errors);
        throw error;
    }
}

async function uploadExtension(accessToken) {
    const form = new FormData();
    form.append('file', fs.createReadStream(EXTENSION_ZIP_PATH));

    try {
        const response = await axios({
            method: 'PUT',
            url: `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${ITEM_ID}`,
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${accessToken}`,
            },
            data: form,
        });
        console.log('Upload Response:', response.data);
    } catch (error) {
        console.error('Error uploading extension:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function publishExtension(accessToken) {
    try {
        const response = await axios({
            method: 'POST',
            url: `https://www.googleapis.com/chromewebstore/v1.1/items/${ITEM_ID}/publish`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log('Publish Response:', response.data);
    } catch (error) {
        console.error('Error publishing extension:', error.response ? error.response.data : error.message);
        throw error;
    }
}

createZip().then(() => {
    getAccessToken().then(async (accessToken) => {
        const status = await checkExtensionStatus(accessToken).catch((error) => {
            console.log("Error in the process:", error);
        });
        console.log("extension status: ", status);
        await uploadExtension(accessToken);
        await publishExtension(accessToken);

    }).catch((error) => {
        console.error('Error in the process:', error.message);
    });
}).catch((error) => {
    console.error('Error in the process:', error.message);
});



