require('dotenv').config();

const getCurrentLogFile = require('./lib/get-current-log-file');
const createLogStream = require('./lib/create-log-stream');
const Path = require('path');

const logFileCollector = async (logPath) => {

    const result = await getCurrentLogFile(logPath);
    logFile = Object.keys(result).filter(file => {
        return result[file] === true;
    })[0];
    if (!logFile) {
        console.log('Looking for log file');
        return await new Promise(resolve => setTimeout(logFileCollector, 5000, logPath));
    } else {
        console.log('Log File Found', logFile);
        return Promise.resolve(logFile);
    }
};

const init = async (shared, settingsServer) => {
    try {
        const logPath = Path.resolve(shared.config.log.directory);
        if (process.env.DEBUG) console.log('logPath', logPath);
        const logFile = await logFileCollector(logPath);
        await createLogStream(shared, logFile);
        console.log('Log stream created');
    } catch (e) {
        console.log(e);
        throw e;
    }
};

module.exports = init;
