const say = require('say');
const { promisify } = require('util');

const speak = async(text, speed = 1.0, voice = false) => {
    return new Promise((resolve, reject) => {
        say.speak(text, voice, speed, (error) => {
            if (error) return reject(error);
            resolve();
        });
    });
}

const init = async () => {
    try {
        await speak(`Warning`);
        await speak(`Extreme Temperatures detected`);
    } catch (e) {
        throw e;
    }
    
};

init();
