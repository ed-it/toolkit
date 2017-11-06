const glob = require('glob-promise');
const Opened = require('@ronomon/opened');
const Tail = require('tail').Tail;

const eventCache = {};

/**
 * Creates a log stream and attaches handlers to the events.
 * @param {*} edHub 
 * @param {*} logFile 
 */
const createLogStream = async (edHub, logFile) => {
    const logStream = new Tail(logFile, { useWatchFile: true });

    /**
     * @inner
     * @type {function}
     * @event line
     * @param chunk {string} - A string of JSON data from log file
     * @returns {void}
     */
    logStream.on('line', async chunk => {
        try {
            const result = JSON.parse(chunk);
            if (process.env.DEBUG) console.log('event', JSON.stringify(result, null, 0));

            let eventTrigger;
            if (!eventCache[result.event]) {
                try {
                    eventCache[result.event] = require(`../events/${result.event}`)({ edHub });
                    eventTrigger = eventCache[result.event];
                } catch (e) {
                    console.log(`No rule for ${result.event}`);
                    return;
                }

                await eventTrigger.set(event);
            }
        } catch (e) {
            console.error(e);
        }
        return;
    });
    logStream.on('error', error => {
        console.log('ERROR: ', error);
    });

    return logStream;
};

/**
 * Returns an array of open files from the Elite log path.  This should only return one file during gameplay
 * @param path {string} - The path to the log file
 * @returns {Array<string>} Returns any open files in the log directory
 */
const getCurrentLogFile = path => {
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
};

module.exports = {
    getCurrentLogFile,
    createLogStream
};
