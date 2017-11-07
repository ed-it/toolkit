const Path = require('path');

const { logFileCollector } = require('./lib/log-file');

module.exports = {
    name: 'log-reader',
    version: '1.0.0',
    register: async (server, options) => {
        const init = async () => {
            try {
                const { directory } = server.app.config.log;
                const logPath = Path.resolve(directory);
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
