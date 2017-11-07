const Bounce = require('bounce');
const huejay = require('huejay');

module.exports = {
    name: 'hub-manager',
    version: '1.0.0',
    register: async (server, options) => {
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
                const { hubs } = request.server.app.config;
                return h.view('hub-manager/templates/manage', { hubs });
            }
        });

        server.route({
            method: 'GET',
            path: '/hubs/discover',
            handler: async (request, h) => {
                let hubs = [];
                try {
                    hubs = await huejay.discover();
                } catch (error) {
                    Bounce.rethrow(error, 'system');
                    return h.view('shared/templates/error', { error });
                }
                request.server.app.config.hubs = hubs;
                return h.redirect('/hubs');
            }
        });

        server.route({
            method: 'GET',
            path: '/hubs/users',
            handler: async (request, h) => {
                const { hubs } = request.server.app.config;
                return h.view('hub-manager/templates/users', { hubs });
            }
        });

        server.route({
            method: 'POST',
            path: '/hubs/users',
            handler: async (request, h) => {
                const { host, set_as_current_user } = request.payload;
                const newUser = new server.app.hub.users.User();
                newUser.device_type = 'edit';
                try {
                    const { username } = await server.app.hub.users.create(newUser);
                    const hubs = server.app.config.hubs.map(hub => {
                        if (hub.ip === host) {
                            hub.username = username;
                        }
                        return hub;
                    });

                    const newConfig = {
                        hubs
                    };

                    if (set_as_current_user === 'yes') {
                        newConfig.hub = { host, username };
                    }
                    await server.methods.updateConfig(newConfig);
                    return h.redirect('/hubs');
                } catch (error) {
                    Bounce.rethrow(error, 'system');
                    return h.view('shared/templates/error', { error });
                }
            }
        });

        server.route({
            method: 'POST',
            path: '/hubs/manage',
            handler: async (request, h) => {
                const { selected, new_name } = request.payload;
                const selectedHub = request.server.app.config.hubs.find(hub => hub.id === selected);
                const { config } = request.server.app;

                const hubs = (request.server.app.config.hubs || []).map(
                    ({ id, ip, name }) =>
                        id === selectedHub.id
                            ? { id, ip, name: name || new_name, current: true }
                            : { id, ip, name: name || new_name }
                );
                console.log(hubs);

                await server.methods.updateConfig({
                    hub: { host: selectedHub.ip, username: config.hub.username },
                    hubs
                });

                return h.redirect('/hubs');
            }
        });
    }
};
