const Tail = require('tail').Tail;
const Path = require('path');
const glob = require('glob-promise');
const Opened = require('@ronomon/opened');

module.exports = {
    name: 'log-reader',
    version: '1.0.0',
    register: async (server, options) => {
        server.method('createLogStream', async logFile => {
            if (sever.app.config.debug) console.log('Creating Stream');
            const logStream = new Tail(logFile, { useWatchFile: true });
            logStream.on('line', async chunk => {
                try {
                    const result = JSON.parse(chunk);
                    if (sever.app.config.debug) console.log('event', JSON.stringify(result, null, 0));
                    const { event, ...params } = result;
                    return await server.methods.triggerEvent(event, params);
                } catch (e) {
                    console.error(e);
                }
                return;
            });
            logStream.on('error', error => {
                console.log('ERROR: ', error);
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
                } catch (e) {
                    reject(e);
                }
            });
        });

        server.method('logFileCollector', async (logDirectory, totalTries) => {
            totalTries = totalTries + 1;
            if (!server.app.debug && totalTries >= 50) {
                throw new Error(`Unable to get log file after 50 attempts, exiting`);
            }
            const result = await server.methods.getCurrentLogFile(logDirectory);
            logFile = Object.keys(result).filter(file => {
                return result[file] === true;
            })[0];
            if (!logFile) {
                return await new Promise(resolve =>
                    setTimeout(server.methods.logFileCollector, 5000, logDirectory, totalTries)
                );
            } else {
                return await server.methods.createLogStream(shared, logFile);
            }
        });

        const init = async () => {
            try {
                const { directory } = server.app.config.log;
                const logPath = Path.resolve(directory);
                if (process.env.DEBUG) console.log('logPath', logPath);
                await server.methods.logFileCollector(logPath);
            } catch (e) {
                console.log(e);
                throw e;
            }
        };

        init();
    }
};
