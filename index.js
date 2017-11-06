require('dotenv').config();

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
const config = require('./config');

const SettingsServer = require('./server');
const logProcess = require('./process');

const init = async () => {
    try {
        const shared = await createSharedState({ config, args, root: __dirname });
        shared.events = await loadEvents({ shared });

        const settingsServer = await SettingsServer(shared);
        await logProcess(shared, settingsServer);
    } catch (e) {
        throw e;
    }
};

init();