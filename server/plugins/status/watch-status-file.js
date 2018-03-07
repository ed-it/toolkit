const fs = require('fs');
const parseFlags = require('./parse-flags');
const createPosition = require('./create-position');

const defaultStatus = {
    event: 'Status',
    Pips: [5, 3, 4],
    Flags: 0,
    GuiPanel: 0,
    Longitude: 0,
    Latitude: 0,
    Altitude: 0,
    Heading: 0
}

module.exports = (server, options) => {

    function triggerEvent(result) {
        const { event, ...params } = result;
        const state = { event, timestamp: Date.now() };

        state.currentShip = server.app.getGlobal('currentShip') || {};
        state.materials = server.app.getGlobal('materials') || {};

        if (params && Object.keys(params).length > 0) {
            const [sys, eng, wep] = params.Pips;
            state.pips = { sys: sys / 2, eng: eng / 2, wep: wep / 2, raw: [sys, eng, wep] };
            state.status = parseFlags(params.Flags);
            state.position = createPosition(params);
            //console.log(state);

            server.publish('/stream/status', state);
            //server.methods.triggerEvent({ event, params });
        }
    }

    return function (statusFile) {
        server.log(['debug'], 'Attempting to create Status.json watcher');

        // Create a file watcher on out status file
        //fs.watchFile(statusFile, (curr, prev) => {
        setInterval(() =>{
            try {
                const data = fs.readFileSync(statusFile);
                if (!data) {
                    server.log[('warning', 'No Data')];
                    return // Don't change last state
                }
                try {
                    const result = JSON.parse(data.toString());
                    return triggerEvent(result);
                } catch (e) {
                    server.log(['error'], `Unable to parse data ${data.toString()}`);
                    return; // Don't change last state
                }
            } catch (e) {
                server.log(['error'], 'Unable to open file stream, does Status.json exist at this location?');
                return triggerEvent(defaultStatus);
            }
        }, 1000);            
        //});
    }
}
