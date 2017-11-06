const { promisify } = require('util');
const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const handlebars = require('handlebars');
const fs = require('fs');
const Path = require('path');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const eventQueue = [];

const init = async shared => {
    const server = new Hapi.Server({ port: shared.config.port || 12342 });

    server.route({
        method: 'GET',
        path: '/',
        handler: async (req, h) => {
            try {
                const source = await readFileAsync(`${__dirname}/views/settings.hbs`);
                const template = handlebars.compile(`${source}`);
                return template(shared.config);
            } catch (e) {
                console.log(e);
                throw e;
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/settings/update',
        handler: async (req, h) => {
            try {
                const { host, username, directory } = req.payload;
                shared.setConfig({ hub: { host, username }, log: { directory }, debug: shared.config.debug, port: shared.config.port });
                await writeFileAsync(Path.resolve('./config.json'), JSON.stringify(shared.config, null, 4));
                return 'Config Saved <a href="/">Go Back</a>';
            } catch (e) {
                console.log(e);
                throw e;
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/test/{event}',
        handler: async (req, h) => {
            try {
                const { event } = req.params;
                const eventPlugin = shared.events[event];
                if (eventPlugin) {
                    await eventPlugin(req.payload);
                    return 'OK';
                }
                return `No plugin for ${event}`;
            } catch (e) {
                throw e;
            }
        }
    });

    await server.start();
};

module.exports = init;
