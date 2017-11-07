module.exports = {
    name: 'static-endpoints',
    version: '1.0.0',
    register: async (server, options) => {
        server.route({
            method: 'GET',
            path: '/',
            handler: async (request, h) => {
                return h.view('static-endpoints/views/home');
            }
        });

        server.route({
            method: 'GET',
            path: '/about',
            handler: async (request, h) => {
                return h.view('static-endpoints/views/about');
            }
        });
    }
};
