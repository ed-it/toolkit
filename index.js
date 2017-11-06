require('dotenv').config();

if (!process.env.ED_LOG_DIR) {
    return console.log(`You need to set the ED_LOG_DIR environment variable`);
}

const args = require('minimist')(process.argv.slice(2));
console.log(args)
const logProcess = require('./process');

const init = async logDir => {
    await logProcess(logDir);
};

init(process.env.ED_LOG_DIR);
