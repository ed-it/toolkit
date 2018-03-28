const loki = require('lokijs');
const Path = require('path');
const fs = require('fs');

module.exports = {
    name: 'aggregations',
    version: '1.0.0',
    description: `Methods for aggregation of data`,
    register: async (server, options) => {
        server.method('getLastKnownLocation', () => {
            const view = server.app.journal.addDynamicView('lastKnownLocation');
            view.applyWhere(obj =>
                [
                    'ApproachBody',
                    'Docked',
                    'FSDJump',
                    'SupercruiseEntry',
                    'SupercruiseExit'
                ].includes(obj.event)
            );
            view.applySimpleSort('timestamp');
            let lastKnownLocation = view
                .data()
                .reduce(
                    (a, b) =>
                        new Date(a.timestamp).getTime() >
                        new Date(b.timestamp).getTime()
                            ? a
                            : b
                );
            if (!lastKnownLocation) {
                lastKnownLocation = {};
            }
            return lastKnownLocation;
        });

        server.method('getSystemJournal', options => {
            console.log('All FSD Jumps');
            const { searchFilter } = options;
            let { page, display } = options;
            if (!page) {
                page = 1;
            }
            if (!display) {
                display = 50;
            }
            console.log(searchFilter);

            const view = server.app.journal.addDynamicView('allFSDJumps');
            view.applyWhere(obj => obj.event === 'FSDJump');
            view.applySimpleSort('timestamp');

            if (searchFilter) {
                view.applyWhere(obj =>
                    obj.params.StarSystem.toLowerCase().includes(
                        searchFilter.toLowerCase()
                    )
                );
            }

            let result = view.data();
            const totalRecords = result.length;

            if (searchFilter) {
                result = result.slice(0, display);
            } else {
                result = result.slice((page - 1) * display, page * display);
            }
            return {
                totalRecords,
                result
            };
        });

        server.method('getSystemList', options => {
            const { searchFilter } = options;
            let { page, display } = options;
            if (!page) {
                page = 1;
            }
            if (!display) {
                display = 50;
            }

            const view = server.app.journal.addDynamicView('allFSDJumps');
            view.applyWhere(obj => obj.event === 'FSDJump');
            view.applySimpleSort('timestamp');

            let result;
            if (searchFilter) {
                view.applyWhere(obj =>
                    obj.params.StarSystem.toLowerCase().includes(
                        searchFilter.toLowerCase()
                    )
                );
            }
            result = view.mapReduce(
                ({ event, timestamp, params }) => {
                    return {
                        starSystem: params.StarSystem,
                        params: params,
                        timestamp,
                        jump: {
                            distance: params.JumpDist,
                            pos: params.StarPos
                        },
                        fuel: {
                            used: params.FuelUsed,
                            level: params.FuelLevel
                        }
                    };
                },
                values =>
                    values.reduce((reducer, jump) => {
                        if (!reducer[jump.starSystem]) {
                            reducer[jump.starSystem] = {
                                starSystem: jump.starSystem,
                                params: jump.params,
                                jumpCount: 0,
                                jumps: []
                            };
                        }
                        reducer[jump.starSystem].jumpCount++;
                        reducer[jump.starSystem].jumps.push({
                            timestamp: jump.timestamp,
                            jump: jump.jump,
                            fuel: jump.fuel
                        });
                        return reducer;
                    }, {})
            );
            result = Object.keys(result).map(key => result[key]);
            const totalRecords = result.length;

            if (searchFilter) {
                result = result.slice(0, display);
            } else {
                result = result.slice((page - 1) * display, page * display);
            }
            return {
                totalRecords,
                result
            };
        });

        server.method('getCurrentShip', () => {
            const view = server.app.journal.addDynamicView('lastLoadout');
            view.applyWhere(obj => obj.event === 'Loadout');
            view.applySimpleSort('timestamp');
            let lastLoadout = view
                .data()
                .reduce(
                    (a, b) =>
                        new Date(a.timestamp).getTime() >
                        new Date(b.timestamp).getTime()
                            ? a
                            : b
                );
            if (!lastLoadout) {
                lastLoadout = {};
            }
            return lastLoadout;
        });

        server.method('getMaterials', () => {
            const view = server.app.journal.addDynamicView('materials');
            view.applyWhere(obj =>
                ['Materials', 'MaterialCollected'].includes(obj.event)
            );
            view.applySimpleSort('timestamp');
            const result = view.data().reverse();

            const materialIndex = result.findIndex(
                item => item.event === 'Materials'
            );
            const toProcess = result.slice(0, materialIndex + 1);

            const materials = toProcess.find(
                item => item.event === 'Materials'
            );
            const materialsCollected = toProcess.filter(
                item => item.event === 'MaterialCollected'
            );

            const materialObj = Object.keys(materials.params).reduce(
                (reducer, param) => {
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
                },
                {}
            );

            materialsCollected.forEach(material => {
                const key = material.Category.toLowerCase();
                if (materialObj[key]) {
                    const item = materialObj[key].resources.find(
                        item => item.Name === material.Name
                    );
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
                location.bodies = await server.methods.getSystemBodies(
                    location.params.StarSystem
                );
                location.stations = await server.methods.getSystemStations(
                    location.params.StarSystem
                );
                location.factions = await server.methods.getSystemFactions(
                    location.params.StarSystem
                );
                location.traffic = await server.methods.getSystemTraffic(
                    location.params.StarSystem
                );
                location.deaths = await server.methods.getSystemDeaths(
                    location.params.StarSystem
                );
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
            path: '/api/system-journal',
            method: 'get',
            handler: async (request, h) => {
                return server.methods.getSystemJournal(request.query);
            }
        });

        server.route({
            path: '/api/system-list',
            method: 'get',
            handler: async (request, h) => {
                return server.methods.getSystemList(request.query);
            }
        });

        server.route({
            path: '/api/logs/bounties',
            method: 'get',
            handler: async (request, h) => {
                const { by } = request.query;

                const view = server.app.journal.addDynamicView('bounties');
                view.applyWhere(obj => obj.event === 'Bounty');
                const results = view.data();

                const result = results.reduce((reducer, line) => {
                    const { event, timestamp, params } = line;
                    // We store per day, so we may need to merge figures
                    let timeKey;
                    if (by === 'hour') {
                        timeKey = Math.floor(
                            new Date(timestamp).getTime() / (1000 * 60 * 60)
                        );
                    } else if (by === 'day') {
                        timeKey = Math.floor(
                            new Date(timestamp).getTime() /
                                (1000 * 60 * 60 * 24)
                        );
                    } else if (by === 'week') {
                        timeKey = Math.floor(
                            new Date(timestamp).getTime() /
                                (1000 * 60 * 60 * 24 * 7)
                        );
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

                    let newFactions = (params.Rewards || []).map(line => ({
                        name: line.Faction,
                        reward: line.Reward
                    }));

                    newFactions.forEach(line => {
                        const index = reducer[timeKey].factions.findIndex(
                            f => f.name === line.name
                        );
                        if (index > -1) {
                            reducer[timeKey].factions[index].reward +=
                                line.reward;
                        } else {
                            reducer[timeKey].factions.push(line);
                        }
                    });

                    reducer[timeKey] = Object.assign(reducer[timeKey], {
                        total: (reducer[timeKey].total +=
                            params.TotalReward || 0)
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
