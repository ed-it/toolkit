const Bounce = require('bounce');
const pkg = require('./package.json');
const allEvents = require('./all-events');

module.exports = {
    name: pkg.name,
    version: pkg.version,
    register: async (server, options) => {
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
                const { lastEventTriggered } = request.server.app;
                return h.view('events/templates/api-event', { allEvents, lastEventTriggered });
            }
        });

        server.route({
            method: 'POST',
            path: '/api/event',
            handler: async (request, h) => {
                try {
                    const { event, params } = request.payload;
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
    }
};
