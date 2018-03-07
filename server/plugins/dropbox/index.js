const Dropbox = require('dropbox').Dropbox;

module.exports = {
    name: 'dropbox',
    version: '1.0.0',
    register: async (server, options) => {
        const dbx = new Dropbox({ accessToken: request.server.app.dropbox.accessToken });
    }
}
