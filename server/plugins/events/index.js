const Bounce = require('bounce');
const Path = require('path');
const glob = require('glob-promise');
const pkg = require('./package.json');
const allEvents = require('./all-events');

module.exports = {
    name: pkg.name,
    version: pkg.version,
    register: async (server, options) => {
        server.method('loadEvents', async eventRoot => {
            const eventPath = Path.resolve(`${eventRoot}/events`);
            const eventPaths = await glob(`${eventPath}/**/!(*.spec).js`);

            const events = eventPaths
                .map(eventPath => {
                    let event;
                    try {
                        event = require(Path.resolve(eventPath))(server.app);
                    } catch (e) {
                        event = false;
                    }
                    return event.event && event;
                })
                .filter(f => !!f)
                .reduce((reducer, e) => ({ ...reducer, [e.event]: e.command }), {});
            return (Object.keys(events).length > 0 && events) || {};
        });

        server.method('triggerEvent', async ({ event, params }) => {
            try {
                const eventFn = server.app.events[event];

                if (!eventFn || typeof eventFn !== 'function') {
                    const newError = new Error(`No event for ${event}`);
                    server.log(['warning'], newError);
                    Bounce.rethrow(newError, 'system');
                    return '';
                }
                server.log(['debug'], `Triggering ${event}`);
                return await eventFn(params);
            } catch (error) {
                server.log(['error'], error);
                Bounce.rethrow(error, 'system');
            }
        });

        server.route({
            method: 'GET',
            path: '/api/event',
            handler: async (request, h) => {
                const { lastEventTriggered, events } = request.server.app;
                return h.view('events/templates/api-event', { allEvents, events, lastEventTriggered });
            }
        });

        server.route({
            method: 'POST',
            path: '/api/event',
            handler: async (request, h) => {
                try {
                    let { event, params } = request.payload;
                    if (params && typeof params === 'string') {
                        params = JSON.parse(params);
                    }
                    const result = await request.server.methods.triggerEvent({ event, params });
                    request.server.app.lastEventTriggered = event;
                    return h.redirect('/api/event');
                } catch (error) {
                    request.log(['error'], error);
                    Bounce.rethrow(error, 'system');
                    return h.view('shared/templates/error', { error });
                }
            }
        });

        const init = async () => {
            try {
                server.app.events = await server.methods.loadEvents(server.app.root);
            } catch (error) {
                server.log(['error'], error);
                Bounce.rethrow(error, 'system');
            }
        };

        init();
    }
};
