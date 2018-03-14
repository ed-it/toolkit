
const bent = require('bent');
const getJSON = bent('json');

module.exports = {
    name: 'edsm',
    version: '1.0.0',
    description: `EDSM API calls`,
    register: async (server, options) => {

        server.method('getSystemBodies', async (systemName) => {
            const url = `https://www.edsm.net/api-system-v1/bodies?systemName=${systemName}`;
            let obj = await getJSON(url)
            return obj;
        });

        server.method('getSystemStations', async (systemName) => {
            const url = `https://www.edsm.net/api-system-v1/stations?systemName=${systemName}`;
            let obj = await getJSON(url)
            return obj;
        });

        server.method('getSystemFactions', async (systemName) => {
            const url = `https://www.edsm.net/api-system-v1/factions?systemName=${systemName}`;
            let obj = await getJSON(url)
            return obj;
        });
        server.method('getSystemTraffic', async (systemName) => {
            const url = `https://www.edsm.net/api-system-v1/traffic?systemName=${systemName}`;
            let obj = await getJSON(url)
            return obj;
        });
        server.method('getSystemDeaths', async (systemName) => {
            const url = `https://www.edsm.net/api-system-v1/deaths?systemName=${systemName}`;
            let obj = await getJSON(url)
            return obj;
        });
    }
}
