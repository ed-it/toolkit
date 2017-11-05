#!/usr/bin/env node
require('dotenv').config();

const Hapi = require('hapi');
const Opened = require('@ronomon/opened');
const glob = require('glob-promise');

const server = Hapi.server({
    port: 10001,
    app: {
        edLogPath: process.env.ED_LOG_DIR
    },
    load: { sampleInterval: 1000 }
});

const getCurrentLogFile = path => {
    return new Promise(async (resolve, reject) => {
        try {
            const logFiles = await glob(`*.log`, { cwd: path });
            const files = logFiles.map(logFile => `${path}/${logFile}`);
            
            Opened.files(files, (error, hashTable) => {
                if (error) return reject(error);
                return resolve(hashTable);
            });
        } catch (e) {
            reject(e);
        }
    });
};

server.route({
    method: 'GET',
    path: '/',
    handler: async (req, h) => {
        try {
            const result = await getCurrentLogFile(process.env.ED_LOG_DIR);
            return Object.keys(result).filter(file => {
              console.log(file, result[file]);
              return result[file] === true;
            });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
});

const init = async () => {
    await server.start();
};

init();
