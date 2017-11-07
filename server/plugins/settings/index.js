const { promisify } = require('util');
const fs = require('fs');
const Path = require('path');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

module.exports = {
    name: 'settings',
    version: '1.0.0',
    register: async (server, options) => {
        server.method('updateConfig', async newConfig => {
            server.app.config = Object.assign({}, server.app.config, newConfig);

            const { root } = server.app;

            await writeFileAsync(
                Path.resolve(`${root}/config.json`),
                JSON.stringify(server.app.config, null, 4)
            );

            return server.app.config;
        });

        server.route({
            method: 'GET',
            path: '/settings',
            handler: async (request, h) => {
                try {
                    const { config } = request.server.app;
                    return h.view(`settings/views/details`, config);
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            }
        });

        server.route({
            method: 'GET',
            path: '/settings/update',
            handler: async (request, h) => {
                const { config } = request.server.app;
                try {
                    return h.view(`settings/views/form`, config);
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            }
        });

        server.route({
            method: 'POST',
            path: '/settings/update',
            handler: async (request, h) => {
                try {
                    const { host, username, directory, debug, port } = request.payload;
                    await server.methods.updateConfig({ hub: { host, username }, log: { directory }, debug, port });
                    return h.redirect('/settings');
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            }
        });
    }
};
