#!/usr/bin/env node
require('dotenv').config();

const getCurrentLogFile = require('./lib/get-current-log-file');
const createLogStream = require('./lib/create-log-stream');
const Path = require('path');

const init = async (shared, settingsServer) => {
    try {
        const logPath = Path.resolve(shared.config.log.directory);
        if (process.env.DEBUG) console.log('logPath', logPath);
        const result = await getCurrentLogFile(logPath);
        const logFile = Object.keys(result).filter(file => {
            return result[file] === true;
        })[0];
        if (process.env.DEBUG) console.log(logFile);

        if (!logFile) {
            throw new Error(`No logfile`);
        }
        await createLogStream(shared, logFile);
        console.log('Log stream created');
    } catch (e) {
        console.log(e);
        throw e;
    }
};

module.exports = init;
