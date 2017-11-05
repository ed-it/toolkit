#!/usr/bin/env node
require('dotenv').config();

const Hapi = require('hapi');
const Opened = require('@ronomon/opened');
const glob = require('glob-promise');
const Path = require('path');
const fs = require('fs');
const Tail = require('tail').Tail;

const createClient = require('../lib/create-client');
const hubClient = createClient({ host: process.env.HUE_HUB_IP, username: process.env.HUE_HUB_USERNAME });

const { STAR_TYPES, setStarColor } = require('../schemes/star-temperature');

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

const createLogStream = async logFile => {
    const logStream = new Tail(logFile, { useWatchFile: true });
    logStream.on('line', async chunk => {
        console.log('line');
        try {
            const result = JSON.parse(chunk);
            console.log('result', result);
            if (result.event === 'StartJump') {
                nextStarValue = result.StarClass;
            }
            if (result.event === 'FSDJump') {
                await setStarColor(hubClient, nextStarValue);
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

const init = async (req, h) => {
    try {
        const result = await getCurrentLogFile(Path.resolve(process.env.ED_LOG_DIR));
        const logFile = Object.keys(result).filter(file => {
            return result[file] === true;
        })[0];
        console.log(logFile);

        if (!logFile) {
            throw new Error(`No logfile`);
        }
        await createLogStream(logFile);
        console.log('Log stream created');
    } catch (e) {
        console.log(e);
        throw e;
    }
};

init();
