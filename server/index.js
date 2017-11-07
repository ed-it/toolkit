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
const eventTrigger = require('./plugins/events');
const hubManager = require('./plugins/hub-manager');
const lightsManager = require('./plugins/lights-manager');
const staticEndpoints = require('./plugins/static-endpoints');

const init = async shared => {
    const server = new Hapi.Server({
        port: shared.config.port || 12342,
        routes: {
            files: {
                relativeTo: `${__dirname}/static`
            }
        }
    });

    Object.keys(shared).forEach(key => (server.app[key] = shared[key]));

    await server.register([
        Inert,
        Vision,
        settings,
        logReader,
        eventTrigger,
        hubManager,
        lightsManager,
        staticEndpoints
    ]);

    server.views({
        engines: { hbs: require('handlebars') },
        path: `${__dirname}/plugins`,
        layoutPath: `${__dirname}/views`,
        layout: true,
        helpersPath: `${__dirname}/views/helpers`,
        isCached: !shared.config.debug
    });
    server.route({
        method: 'GET',
        path: '/static/{param*}',
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true,
                index: true
            }
        }
    });

    await server.start();
};

module.exports = init;
