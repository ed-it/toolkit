const Tail = require('tail').Tail;
const Path = require('path');
const glob = require('glob-promise');
const Opened = require('@ronomon/opened');

/**
 * Creates a tail of the open log file. When it finds and event in the shared events
 * cache it passed the event to it's method with the shared context
 * @param {SharedContext} shared The shared context
 * @param {string} logFile The log file to tail
 * @returns {LogStream} The log stream object
 */
const createLogStream = async (shared, logFile) => {
    if (shared.debug) console.log('Creating Stream');
    const logStream = new Tail(logFile, { useWatchFile: true });
    logStream.on('line', async chunk => {
        try {
            const result = JSON.parse(chunk);
            if (shared.debug) console.log('event', JSON.stringify(result, null, 0));

            const event = shared.events[result.event];

            if (!event) {
                if (shared.debug) console.log(`No event for ${result.event}`);
                return;
            }
            if (shared.debug) console.log(`Triggering ${result.event}`)
            await event(result);
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
 * Takes a folder path and gets all files in the folder, then checks to see if any are
 * currently opened by any other processes
 * @param {string} path The directory to watch
 * @returns {Array<string>} The current open files in the folder
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

/**
 * Creates a loop that waits until there is an open file from Elite Dangerous, it checks every
 * 5 seconds. Once it's found it creates the log stream
 * @param {SharedContext} shared The shared contetx
 * @param {string} logDirectory The path to the log file directory
 * @param {number} totalTries Number of tries of this method, when it reaches 50 the method will throw
 */
const logFileCollector = async (shared, logDirectory, totalTries = 0) => {
    totalTries = totalTries + 1;
    if (totalTries >= 50) {
        throw new Error(`Unable to get log file after 50 attempts, exiting`);
    }
    const result = await getCurrentLogFile(logDirectory);
    logFile = Object.keys(result).filter(file => {
        return result[file] === true;
    })[0];
    if (!logFile) {
        return await new Promise(resolve => setTimeout(logFileCollector, 5000, shared, logDirectory, totalTries));
    } else {
        return await createLogStream(shared, logFile);
    }
};

module.exports = {
    logFileCollector,
    getCurrentLogFile,
    createLogStream
};