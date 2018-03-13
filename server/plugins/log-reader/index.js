const Tail = require('tail').Tail;
const Path = require('path');
const glob = require('glob-promise');
const Opened = require('@ronomon/opened');
const Bounce = require('bounce');

module.exports = {
    name: 'log-reader',
    version: '1.0.0',
    description: `The log reader plugin sets up a watcher on your Elite: Dangerous
    log directory. When the game opens a file, the log reader will listen for all events and
    emit them on an event stream.`,
    register: async (server, options) => {
        server.method('createLogStream', async logFile => {
            server.log(['trace'], 'Creating Stream');
            const logFileName = logFile.split(Path.sep).pop();
            const logStream = new Tail(logFile, { useWatchFile: true });

            logStream.on('line', async chunk => {
                try {
                    const result = JSON.parse(chunk);
                    server.log(['debug', 'event'], result);
                    const { event, timestamp, ...params } = result;
                    const conf = Object.assign({}, server.app.config, { ...server.app.config.log, lastFileSaved: logFileName });
                    await server.methods.updateConfig(conf);
                    server.app.collection.insert({
                        event,
                        timestamp,
                        params,
                        journal: logFileName
                    });
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

        server.method('getLogFiles', async path => {
            return new Promise(async (resolve, reject) => {
                try {
                    const logFiles = await glob(`*.log`, { cwd: path });
                    const files = logFiles.map(logFile => Path.resolve(`${path}/${logFile}`));
                    resolve(files);
                } catch (e) {
                    server.log(['error'], e);
                    reject(e);
                }
            });
        });

        server.method('getCurrentLogFile', async path => {
            return new Promise(async (resolve, reject) => {
                try {
                    const files = await server.methods.getLogFiles(path);
                    Opened.files(files, (error, hashTable) => {
                        if (error) {
                            server.log(['error'], error);
                            return Bounce.rethrow(error, 'system');
                        }
                        return resolve(hashTable);
                    });
                } catch (error) {
                    server.log(['error'], error);
                    Bounce.rethrow(error, 'system');
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
