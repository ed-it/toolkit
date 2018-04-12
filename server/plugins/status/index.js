const fs = require('fs');
const Tail = require('tail').Tail;
const Path = require('path');
const glob = require('glob-promise');
const Opened = require('@ronomon/opened');
const Bounce = require('bounce');
const Nes = require('nes');

const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const parseFlags = require('./parse-flags');

module.exports = {
    name: 'status-reader',
    version: '1.0.0',
    register: async (server, options) => {
        const { directory } = server.app.config.log;
        const statusFile = Path.resolve(directory, 'Status.json');

        // Register a websocket endpoint
        server.subscription('/stream/status');

        // We call this method on init to start a file watcher and trigger server events

        server.method('parseStatusFile', async statusFile => {
            try {
                const data = await readFileAsync(statusFile);
                try {
                    const result = JSON.parse(data.toString().trim());
                    const { event, timestamp, ...params } = result;
                    const state = { event, timestamp, params: {} };

                    if (params && Object.keys(params).length > 0) {
                        const [sys, eng, wep] = params.Pips ? params.Pips : [4, 4, 4];
                        state.params.pips = { sys: sys / 2, eng: eng / 2, wep: wep / 2, raw: [sys, eng, wep] };
                        state.params.status = parseFlags(params.Flags);
                        state.params.position = {
                            latitude: params.Latitude || 0,
                            longitude: params.Longitude || 0,
                            altitude: params.Altitude || 0,
                            heading: params.Heading || 0
                        };
                        
                        state.params.currentShip = server.methods.getCurrentShip();
                        state.params.currentLocation = server.methods.getLastKnownLocation();
                    }
                    return state;
                } catch (e) {
                    throw e;
                }
            } catch (e) {
                throw e;
            }
        });

        server.method('createStatusStream', async statusFile => {
            fs.watchFile(statusFile, async (curr, prev) => {
                try {
                    let result = await server.methods.parseStatusFile(statusFile);
                    if (!result) {
                        result = defaultStatus;
                    }
                    await server.broadcast(result);
                } catch (e) {
                    server.log(['error', e]);
                }
            });
        });

        /**
         * Static page for viewing the status
         */
        server.route({
            method: 'GET',
            path: '/api/status',
            handler: async (request, h) => {
                try {
                    const result = await server.methods.parseStatusFile(statusFile);
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
                server.log(['debug'], `Status File: ${statusFile}`);
                return await server.methods.createStatusStream(statusFile);
            } catch (error) {
                server.log(['error'], error);
                Bounce.rethrow(error, 'system');
            }
        };

        init();
    }
};
