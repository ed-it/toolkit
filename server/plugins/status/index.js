const fs = require('fs');
const Tail = require('tail').Tail;
const Path = require('path');
const glob = require('glob-promise');
const Opened = require('@ronomon/opened');
const Bounce = require('bounce');
const Nes = require('nes');

const statusStream = require('./watch-status-file');

module.exports = {
    name: 'status-reader',
    version: '1.0.0',
    register: async (server, options) => {

        // Register a websocket endpoint
        await server.register(Nes);
        server.subscription('/stream/status');

        // We call this method on init to start a file watcher and trigger server events
        server.method('createStatusStream', statusStream(server, options));

        /**
         * Static page for viewing the status
         */
        server.route({
            method: 'GET',
            path: '/status',
            handler: async (request, h) => {
                try {
                    const { config } = request.server.app;
                    return h.view(`status/views/status`, config);
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
                const statusFile = Path.join(logPath, 'Status.json');
                server.log(['debug'], `Status File: ${statusFile}`);
                return server.methods.createStatusStream(statusFile);
            } catch (error) {
                server.log(['error'], error);
                Bounce.rethrow(error, 'system');
            }
        };

        init();
    }
};
