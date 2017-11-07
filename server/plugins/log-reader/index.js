const Tail = require('tail').Tail;
const Path = require('path');
const glob = require('glob-promise');
const Opened = require('@ronomon/opened');
const Bounce = require('bounce');

module.exports = {
    name: 'log-reader',
    version: '1.0.0',
    register: async (server, options) => {
        server.method('createLogStream', async logFile => {
            server.log(['trace'], 'Creating Stream');
            const logStream = new Tail(logFile, { useWatchFile: true });

            logStream.on('line', async chunk => {
                try {
                    const result = JSON.parse(chunk);
                    server.log(['debug', 'event'], result);
                    const { event, ...params } = result;
                    return await server.methods.triggerEvent(event, params);
                } catch (error) {
                    Bounce.rethrow(error, 'system');
                }
            });
            logStream.on('error', error => {
                server.log(['error', error]);
                Bounce.rethrow(error, 'system');
            });

            return logStream;
        });

        server.method('getCurrentLogFile', async path => {
            return new Promise(async (resolve, reject) => {
                try {
                    const logFiles = await glob(`*.log`, { cwd: path });
                    const files = logFiles.map(logFile => Path.resolve(`${path}/${logFile}`));

                    Opened.files(files, (error, hashTable) => {
                        if (error) return reject(error);
                        return resolve(hashTable);
                    });
                } catch (error) {
                    server.log(['error'], error);
                    reject(error);
                }
            });
        });

        server.method('logFileCollector', async (logDirectory, totalTries) => {
            totalTries = totalTries + 1;
            try {
                const result = await server.methods.getCurrentLogFile(logDirectory);
                logFile = Object.keys(result).filter(file => {
                    return result[file] === true;
                })[0];
                if (!logFile) {
                    return await new Promise(resolve => setTimeout(server.methods.logFileCollector, 5000, logDirectory, totalTries));
                }
                server.app.currentLogFile = logFile;
                return await server.methods.createLogStream(logFile);
            } catch (error) {
                server.log(['error'], error);
                Bounce.rethrow(error, 'system');
            }
        });

        const init = async () => {
            try {
                const { directory } = server.app.config.log;
                const logPath = Path.resolve(directory);
                server.log(['debug'], logPath);
                await server.methods.logFileCollector(logPath);
            } catch (error) {
                server.log(['error'], error);
                Bounce.rethrow(error, 'system');
            }
        };

        init();
    }
};
