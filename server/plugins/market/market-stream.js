const fs = require('fs');

const parseMarketFile = require('./parse-market');

module.exports = (server, options) => {
    return function(marketFile) {
        server.log(['debug'], 'Attempting to create Market.json watcher');
        // Create a file watcher on out status file
        fs.watchFile(marketFile, async (curr, prev) => {
            console.log('change happened');
            try {
                const result = await parseMarketFile(marketFile);
                if (!result) {
                    return server.log[('warning', 'No Data')];
                }
                await server.broadcast(result);
            } catch (e) {
                server.log(['error', e]);
            }
        });
    };
};
