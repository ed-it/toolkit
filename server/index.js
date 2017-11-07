const { promisify } = require('util');
const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const handlebars = require('handlebars');
const fs = require('fs');
const Path = require('path');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const logReader = require('./plugins/log-reader');
const eventTrigger = require('./plugins/event-trigger');

const init = async shared => {
    const server = new Hapi.Server({ port: shared.config.port || 12342 });

    Object.keys(shared).forEach(key => (server.app[key] = shared[key]));

    await server.register([Inert, Vision, logReader, eventTrigger]);

    server.views({
        engines: { html: require('handlebars') },
        path: __dirname + '/views',
        layout: true
    });

    server.route({
        method: 'GET',
        path: '/settings',
        handler: async (req, h) => {
            try {
                return h.view(`settings/details`, req.server.app.config);
            } catch (e) {
                console.log(e);
                throw e;
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/settings/update',
        handler: async (req, h) => {
            try {
                return h.view(`settings/form`, req.server.app.config);
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
                shared.setConfig({ hub: { host, username }, log: { directory }, debug: req.server.app.config.debug, port: req.server.app.config.port });
                await writeFileAsync(Path.resolve('./config.json'), JSON.stringify(req.server.app.config, null, 4));
                return h.redirect('/settings');
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
                const eventPlugin = req.server.app.events[event];
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
