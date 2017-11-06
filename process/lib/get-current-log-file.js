const glob = require('glob-promise');
const Opened = require('@ronomon/opened');

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

module.exports = getCurrentLogFile;