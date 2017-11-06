require('dotenv').config();

const { createClient, rgbToXy, xyToRgb } = require('../lib');
const hubClient = createClient({ host: process.env.HUE_HUB_IP, username: process.env.HUE_HUB_USERNAME });
const switchLights = require('./switch-lights');

module.exports = () => ({
    client: hubClient,
    rgbToXy,
    xyToRgb,
    switch: switchLights(hubClient),
    sleep: ms => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});
