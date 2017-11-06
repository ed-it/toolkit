const Tail = require('tail').Tail;

const createLogStream = async (shared, logFile) => {
    console.log('Creating Stream');
    const logStream = new Tail(logFile, { useWatchFile: true });
    logStream.on('line', async chunk => {
        try {
            const result = JSON.parse(chunk);
            if (process.env.DEBUG) console.log('event', JSON.stringify(result, null, 0));

            const event = shared.events[result.event];

            if (!event) {
                if (process.env.DEBUG) console.log(`No event for ${result.event}`);
                return;
            }
            if (process.env.DEBUG) console.log(`Triggering ${result.event}`)
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

module.exports = createLogStream;
