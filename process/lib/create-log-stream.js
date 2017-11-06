const Tail = require('tail').Tail;

const eventCache = {};

const createLogStream = async (edHub, logFile) => {
    const logStream = new Tail(logFile, { useWatchFile: true });
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

module.exports = createLogStream;
