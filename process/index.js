#!/usr/bin/env node
require('dotenv').config();

const Opened = require('@ronomon/opened');
const glob = require('glob-promise');
const Path = require('path');
const fs = require('fs');
const Tail = require('tail').Tail;

const getCurrentLogFile = require('./lib/get-current-log-file');
const createLogStream = require('./lib/create-log-stream');
const Path = require('path');
const createHub = require('../lib/create-hub');

const init = async logDir => {
    const edHub = createHub();

    try {
        const logPath = Path.resolve(logDir);
        if (process.env.DEBUG) console.log('logPath', logPath);
        const result = await getCurrentLogFile(logPath);
        const logFile = Object.keys(result).filter(file => {
            return result[file] === true;
        })[0];
        if (process.env.DEBUG) console.log(logFile);

        if (!logFile) {
            throw new Error(`No logfile`);
        }
        await createLogStream(edHub, logFile);
        console.log('Log stream created');
    } catch (e) {
        console.log(e);
        throw e;
    }
};

module.exports = init;
