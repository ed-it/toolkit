module.exports = {
    name: 'lights-manager',
    version: '1.0.0',
    register: async (server, options) => {
        server.route({
            method: 'get',
            path: '/lights',
            handler: async (reqeust, h) => {
                try {
                    const lights = await server.app.hub.lights.getAll();
                    return h.view('hue-integration/lights-manager/templates/index', {
                        lights,
                        labels: { rgb: ['Red', 'Green', 'Blue'] }
                    });
                } catch (error) {
                    request.log(['error'], error);
                    Bounce.rethrow(error, 'system');
                    return h.view('shared/templates/error', { error });
                }
            }
        });
    }
};
