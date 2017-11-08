#!/usr/bin/env node

process.on('unhandledRejection', err => {
    /*eslint-disable */
    console.log(err.stack);
    process.exit(1);
    /*eslint-enable */
});

process.on('uncaughtException', error => {
    /*eslint-disable */
    console.log(error.stack); // to see your exception details in the console
    process.exit(1);
    /*eslint-enable */
});

const createSharedState = require('./lib/create-shared-state');
const loadEvents = require('./lib/load-events');

const args = require('minimist')(process.argv.slice(2));

const SettingsServer = require('./server');

const loadConfig = async () => {
    let config;
    try {
        config = require('./config');
    } catch (e) {
        config = {
            hub: {
                ip: '',
                username: ''
            },
            log: {
                directory: ''
            },
            debug: false,
            port: 12342
        };
    }
    return config;
};

const init = async () => {
    try {
        const config = await loadConfig();
        const shared = await createSharedState({ config, args, root: __dirname });
        shared.events = await loadEvents({ shared });

        await SettingsServer(shared);
    } catch (e) {
        throw e;
    }
};

init();
