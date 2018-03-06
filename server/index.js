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
const statusReader = require('./plugins/status');
const eventTrigger = require('./plugins/events');
const hueIntegration = require('./plugins/hue-integration');
const staticEndpoints = require('./plugins/static-endpoints');


const init = async shared => {
    const server = new Hapi.Server({
        port: shared.config.port || 12342,
        routes: {
            files: {
                relativeTo: `${__dirname}/static`
            }
        },
        debug: {
            log: shared.config.debug ? ['error', 'debug'] : ['error'],
            request: shared.config.debug ? ['error', 'debug'] : ['error']
        }
    });

    Object.keys(shared).forEach(key => (server.app[key] = shared[key]));

    await server.register([Inert, Vision, settings, logReader, eventTrigger, hueIntegration, staticEndpoints, statusReader]);

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
        path: '/node_modules/{param*}',
        handler: {
            directory: {
                path: '../../node_modules',
                redirectToSlash: true,
                index: true
            }
        }
    });
    server.route({
        method: 'GET',
        path: '/{param*}',
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
