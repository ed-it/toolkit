const fs = require('fs');
const Tail = require('tail').Tail;
const Path = require('path');
const glob = require('glob-promise');
const Opened = require('@ronomon/opened');
const Bounce = require('bounce');

const marketStream = require('./watch-market-file');
const parseMarketFile = require('./parse-market');

module.exports = {
    name: 'market',
    version: '1.0.0',
    register: async (server, options) => {
        // Register a websocket endpoint
        server.subscription('/stream/market');

        // We call this method on init to start a file watcher and trigger server events
        server.method('createMarketStream', marketStream(server, options));

        /**
         * Static page for viewing the status
         */
        server.route({
            method: 'GET',
            path: '/market',
            handler: async (request, h) => {
                try {
                    const { config } = request.server.app;
                    return h.view(`market/views/market`, config);
                } catch (error) {
                    request.log(['error'], error);
                    Bounce.rethrow(error, 'system');
                    return h.view('shared/templates/error', { error });
                }
            }
        });

        server.route({
            method: 'GET',
            path: '/api/market',
            handler: async (request, h) => {
                try {
                    const { directory } = server.app.config.log;
                    const logPath = Path.resolve(directory, 'Market.json');
                    const result = await parseMarketFile(logPath);
                    return result;
                } catch (error) {
                    request.log(['error'], error);
                    Bounce.rethrow(error, 'system');
                    return h.view('shared/templates/error', { error });
                }
            }
        });

        const init = async () => {
            try {
                const { directory } = server.app.config.log;
                const logPath = Path.resolve(directory);
                server.log(['debug'], 'Status Plugin');
                const marketFile = Path.join(logPath, 'Market.json');
                server.log(['debug'], `Status File: ${marketFile}`);
                return server.methods.createMarketStream(marketFile);
            } catch (error) {
                server.log(['error'], error);
                Bounce.rethrow(error, 'system');
            }
        };

        init();
    }
};
