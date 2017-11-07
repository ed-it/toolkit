const Bounce = require('bounce');
const pkg = require('./package.json');

module.exports = {
    name: pkg.name,
    version: pkg.version,
    register: async (server, options) => {
        server.method('triggerEvent', async ({ event, params }) => {
            const eventFn = server.app.events[event];

            if (!eventFn || typeof eventFn !== 'function') {
                if (server.app.debug) console.log(`No event for ${event}`);
                throw new Error(`No event for ${event}`);
            }
            if (server.app.debug) console.log(`Triggering ${event}`);
            return await eventFn(params);
        });

        server.route({
            method: 'POST',
            path: '/api/event',
            handler: async (request, h) => {
                try {
                    const result = await server.methods.triggerEvent(request.payload);
                    return { status: 'ok', result };
                } catch (error) {
                    Bounce.rethrow(error, 'system');
                    return h.view('shared/templates/error', { error });
                }
            }
        });
    }
};
