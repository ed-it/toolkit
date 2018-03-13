const { promisify } = require('util');
const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const handlebars = require('handlebars');
const fs = require('fs');
const Path = require('path');
const loki = require('lokijs');
const Nes = require('nes');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const settings = require('./plugins/settings');
const logReader = require('./plugins/log-reader');
const statusReader = require('./plugins/status');
const eventTrigger = require('./plugins/events');
const hueIntegration = require('./plugins/hue-integration');
const staticEndpoints = require('./plugins/static-endpoints');
const logImporter = require('./plugins/importer');
const aggregations = require('./plugins/aggregations');
const market = require('./plugins/market');

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

    const dbPath = Path.resolve(`${server.app.root}`, 'db', 'log-entries.json');

    server.app.db = new loki(dbPath, {
        autoload: true,
        autoloadCallback: () => {
            let collection = server.app.db.getCollection('journal-lines');
            if (!collection) {
                collection = server.app.db.addCollection('journal-lines');
            }
            server.app.collection = collection;
            return collection;
        },
        autosave: true,
        autosaveInterval: 5000
    });

    await server.register(Nes);
    await server.register([Inert, Vision, settings, logReader, logImporter, eventTrigger, hueIntegration, staticEndpoints, statusReader, aggregations, market]);

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
