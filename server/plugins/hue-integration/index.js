const pkg = require('./package.json');

const hubManager = require('./hub-manager');
const lightsManager = require('./lights-manager');

/**
 * @module hue-integration
 * @type {HapiPlugin}
 */
module.exports = {
    name: pkg.name,
    version: pkg.version,
    /**
     * Registers the plugin
     * @type {function}
     */
    register: async (server, options) => {

        await server.register([hubManager, lightsManager]);
        
    }
}


/**
 * @typedef {object} HapiPlugin
 * @property {string} name Name of the plugin
 * @property {string} version Version of the plugin
 * @property {Function} register The plugin registration function
 */
