const { promisify } = require('util');
const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const handlebars = require('handlebars');
const fs = require('fs');
const Path = require('path');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const settings = require('./plugins/settings');
const logReader = require('./plugins/log-reader');
const eventTrigger = require('./plugins/event-trigger');
const hubManager = require('./plugins/hub-manager');
const lightsManager = require('./plugins/lights-manager');

const init = async shared => {
    const server = new Hapi.Server({ port: shared.config.port || 12342 });

    Object.keys(shared).forEach(key => (server.app[key] = shared[key]));

    await server.register([Inert, Vision, settings, logReader, eventTrigger, hubManager, lightsManager]);

    server.views({
        engines: { html: require('handlebars') },
        path: `${__dirname}/plugins`,
        layoutPath: `${__dirname}/views`,
        layout: true,
        helpersPath: `${__dirname}/views/helpers`
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
