module.exports = {
    name: 'lights-manager',
    version: '1.0.0',
    register: async (server, options) => {
        server.route({
            method: 'get',
            path: '/lights',
            handler: async (reqeust, h) => {
                const hubLights = {
                    a: [],
                    b: []
                };
                return h.view('lights-manager/templates/index.html', { hubLights });
            }
        });
    }
};
