const huejay = require('huejay');

module.exports = {
    name: 'hub-manager',
    version: '1.0.0',
    register: async (server, options) => {
        let lastHubRequest = null;

        server.method('getHubs', async () => {
            let hubs;
            try {
                hubs = require(`${server.app.root}/hubs.json`);
            } catch (e) {
                hubs = [];
            }
            return hubs;
        });

        server.method('saveHubConfig', async () => {});

        server.route({
            method: 'GET',
            path: '/hubs',
            handler: async (request, h) => {
                const { hubs } = request.server.app.config;
                return h.view('hub-manager/templates/index', { hubs: hubs || [] });
            }
        });

        server.route({
            method: 'GET',
            path: '/hubs/manage',
            handler: async (request, h) => {
                let hubs = [];
                try {
                    hubs = await huejay.discover();
                } catch (e) {
                    throw e;
                }
                lastHubRequest = hubs;
                return h.view('hub-manager/templates/manage', { hubs });
            }
        });

        server.route({
            method: 'POST',
            path: '/hubs/manage',
            handler: async (request, h) => {
                const { selected } = request.payload;
                const selectedHub = lastHubRequest.find(hub => hub.id === selected);
                const { config } = request.server.app;

                await server.methods.updateConfig({
                    hub: { host: selectedHub.ip, username: config.hub.username },
                    hubs: lastHubRequest
                });

                return h.redirect('/hubs');
            }
        });
    }
};
