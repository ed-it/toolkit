require('dotenv').config();

const { createClient, rgbToXy, xyToRgb } = require('../lib');

const switchLights = require('./switch-lights');

module.exports = config => {
    const { host, username } = config.hueHub;
    const hubClient = createClient({ host, username });

    const globals = {};
    const eventQueue = [];

    return {
        eventQueue,
        setGlobal: (key, val) => globals[key] = val,
        getGlobal: (key) => globals[key],
        client: hubClient,
        rgbToXy,
        xyToRgb,
        switch: switchLights(hubClient),
        sleep: ms => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    };
};
