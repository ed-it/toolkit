const loki = require('lokijs');
const Path = require('path');
const fs = require('fs');

module.exports = {
    name: 'aggregations',
    version: '1.0.0',
    description: `Methods for aggregation of data`,
    register: async (server, options) => {
        server.method('getLastKnownLocation', () => {
            const view = server.app.collection.addDynamicView('lastKnownLocation');
            view.applyWhere(obj => ['ApproachBody', 'Docked', 'FSDJump', 'SupercruiseEntry', 'SupercruiseExit'].includes(obj.event));
            view.applySimpleSort('timestamp');
            let lastKnownLocation = view.data().reduce((a, b) => (new Date(a.timestamp).getTime() > new Date(b.timestamp).getTime() ? a : b));
            if (!lastKnownLocation) {
                lastKnownLocation = {};
            }
            return lastKnownLocation;
        });

        server.method('getCurrentShip', () => {
            const view = server.app.collection.addDynamicView('lastLoadout');
            view.applyWhere(obj => obj.event === 'Loadout');
            view.applySimpleSort('timestamp');
            let lastLoadout = view.data().reduce((a, b) => (new Date(a.timestamp).getTime() > new Date(b.timestamp).getTime() ? a : b));
            if (!lastLoadout) {
                lastLoadout = {};
            }
            return lastLoadout;
        });

        server.method('getMaterials', () => {
            const view = server.app.collection.addDynamicView('materials');
            view.applyWhere(obj => ['Materials', 'MaterialCollected'].includes(obj.event));
            view.applySimpleSort('timestamp');
            const result = view.data().reverse();

            const materialIndex = result.findIndex(item => item.event === 'Materials');
            const toProcess = result.slice(0, materialIndex + 1);

            const materials = toProcess.find(item => item.event === 'Materials');
            const materialsCollected = toProcess.filter(item => item.event === 'MaterialCollected');

            const materialObj = Object.keys(materials.params).reduce((reducer, param) => {
                const mKey = param.toLowerCase();
                const resources = materials.params[param];
                if (!reducer[mKey]) {
                    reducer[mKey] = {
                        key: mKey,
                        name: param,
                        resources
                    };
                }
                return reducer;
            }, {});

            materialsCollected.forEach(material => {
                const key = material.Category.toLowerCase();
                if (materialObj[key]) {
                    const item = materialObj[key].resources.find(item => item.Name === material.Name);
                    item.Count += material.Count;
                }
            });

            return materialObj;
        });

        server.route({
            path: '/api/location',
            method: 'get',
            handler: async (request, h) => {
                const location = await server.methods.getLastKnownLocation();
                console.log(location);
                location.bodies = await server.methods.getSystemBodies(location.params.StarSystem);
                location.stations = await server.methods.getSystemStations(location.params.StarSystem);
                location.factions = await server.methods.getSystemFactions(location.params.StarSystem);
                location.traffic = await server.methods.getSystemTraffic(location.params.StarSystem);
                location.deaths = await server.methods.getSystemDeaths(location.params.StarSystem);
                return location;
            }
        });

        server.route({
            path: '/api/materials',
            method: 'get',
            handler: async (request, h) => {
                return server.methods.getMaterials();
            }
        });

        server.route({
            path: '/api/logs/bounties',
            method: 'get',
            handler: async (request, h) => {
                const { by } = request.query;

                const view = server.app.collection.addDynamicView('bounties');
                view.applyWhere(obj => obj.event === 'Bounty');
                const results = view.data();

                const result = results.reduce((reducer, line) => {
                    const { event, timestamp, params } = line;
                    // We store per day, so we may need to merge figures
                    let timeKey;
                    if (by === 'hour') {
                        timeKey = Math.floor(new Date(timestamp).getTime() / (1000 * 60 * 60));
                    } else if (by === 'day') {
                        timeKey = Math.floor(new Date(timestamp).getTime() / (1000 * 60 * 60 * 24));
                    } else if (by === 'week') {
                        timeKey = Math.floor(new Date(timestamp).getTime() / (1000 * 60 * 60 * 24 * 7));
                    } else {
                        timeKey = 'all';
                    }

                    if (!reducer[timeKey]) {
                        reducer[timeKey] = {
                            timestamp,
                            total: 0,
                            factions: []
                        };
                    }

                    let newFactions = (params.Rewards || []).map(line => ({ name: line.Faction, reward: line.Reward }));

                    newFactions.forEach(line => {
                        const index = reducer[timeKey].factions.findIndex(f => f.name === line.name);
                        if (index > -1) {
                            reducer[timeKey].factions[index].reward += line.reward;
                        } else {
                            reducer[timeKey].factions.push(line);
                        }
                    });

                    reducer[timeKey] = Object.assign(reducer[timeKey], {
                        total: (reducer[timeKey].total += params.TotalReward || 0)
                    });
                    return reducer;
                }, {});

                return {
                    total: results.length,
                    count: Object.keys(result).length,
                    result
                };
            }
        });
    }
};
