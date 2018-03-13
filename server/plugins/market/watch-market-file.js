const fs = require('fs');

const parseMarketFile = require('./parse-market');

module.exports = (server, options) => {
    function triggerEvent(result) {
        server.publish('/stream/market', result);
    }

    return function(marketFile) {
        server.log(['debug'], 'Attempting to create Market.json watcher');

        // Create a file watcher on out status file
        fs.watchFile(marketFile, async (curr, prev) => {
            console.log('change happened');
            //setInterval(() =>{
            try {
                const result = await parseMarketFile(marketFile);
                if (!result) {
                    return server.log[('warning', 'No Data')];
                }
                triggerEvent(result);
            } catch (e) {
                server.log(['error', e]);
                //server.log(['error'], 'Unable to open file stream, does Status.json exist at this location?');
                //return triggerEvent(defaultStatus);
            }
            //}, 1000);
        });
    };
};
