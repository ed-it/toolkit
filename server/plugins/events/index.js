const Bounce = require('bounce');
const pkg = require('./package.json');

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
            method: 'POST',
            path: '/api/event',
            handler: async (request, h) => {
                try {
                    const result = await server.methods.triggerEvent(request.payload);
                    return { status: 'ok', result };
                } catch (error) {
                    request.log(['error'], error);
                    Bounce.rethrow(error, 'system');
                    return h.view('shared/templates/error', { error });
                }
            }
        });
    }
};
