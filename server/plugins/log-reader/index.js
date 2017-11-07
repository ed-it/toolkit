const Path = require('path');

const { logFileCollector } = require('./lib/log-file');

module.exports = {
    name: 'log-reader',
    version: '1.0.0',
    register: async (server, options) => {
        const init = async () => {
            try {
                const logPath = Path.resolve(server.app.config.log.directory);
                if (process.env.DEBUG) console.log('logPath', logPath);
                await logFileCollector(server.app, logPath);
            } catch (e) {
                console.log(e);
                throw e;
            }
        };

        init();
    }
};
