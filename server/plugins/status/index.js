const fs = require('fs');
const Tail = require('tail').Tail;
const Path = require('path');
const glob = require('glob-promise');
const Opened = require('@ronomon/opened');
const Bounce = require('bounce');
const Nes = require('nes');

const parseFlags = require('./parse-flags');

module.exports = {
    name: 'status-reader',
    version: '1.0.0',
    register: async (server, options) => {
        await server.register(Nes);
        server.subscription('/api/status');

        server.method('createStatusStream', statusFile => {
            server.log(['debug'], 'Creating Status');
            const logStream = fs.watchFile(statusFile, (curr, prev) => {
                let data;
                try {
                    data = fs.readFileSync(statusFile);
                    if (!data) {
                        server.log[('warning', 'No Data')];
                        return;
                    }    
                } catch (e) {
                    console.error(e);
                    return;
                }
                let result;
                try {
                    result = JSON.parse(data.toString());
                } catch (e) {
                    console.error(e);
                    return;
                }
                const { event, ...params } = result;

                const [sys, eng, wep] = params.Pips;
                const flags = params.Flags;
                const status = parseFlags(flags);

                server.publish('/api/status', { event, pips: { sys, eng, wep, raw: params.Pips }, status });
                server.methods.triggerEvent({ event, params });
            });
        });

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

        // server.route({
        //     method: 'GET',
        //     path: '/api/status',
        //     config: {
        //         id: 'status',
        //         handler: (request, h) => {

        //             return 'world!';
        //         }
        //     }
        // })

        const init = async () => {
            try {
                const { directory } = server.app.config.log;
                const logPath = Path.resolve(directory);
                server.log(['debug'], 'Status Plugin');
                const statusFile = Path.join(logPath, 'Status.json');
                console.log(statusFile);
                return server.methods.createStatusStream(statusFile);
            } catch (error) {
                server.log(['error'], error);
                Bounce.rethrow(error, 'system');
            }
        };

        init();
    }
};
