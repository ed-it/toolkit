const Path = require('path');
const glob = require('glob-promise');

module.exports = async ({ shared }) => {
    const eventPath = Path.resolve(`${shared.root}/events`);
    const eventPaths = await glob(`${eventPath}/**/!(*.spec).js`);

    const events = eventPaths
        .map(eventPath => {
            let event;
            try {
                event = require(Path.resolve(eventPath))(shared);
            } catch (e) {
                event = false;
            }
            return event.event && event;
        })
        .filter(f => !!f)
        .reduce((reducer, event) => {
            reducer[event.event] = event.command;
            return reducer;
        }, {});

    return events;
};
