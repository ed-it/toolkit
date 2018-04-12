const loki = require('lokijs');
const Path = require('path');
const fs = require('fs');

function dynamicViewData(server, name, find, sort) {
    const view = server.app.journal.addDynamicView(name);
    find.forEach(findFn => view.applyWhere(findFn));

    if (sort === 'timestamp') {
        view.applySimpleSort('timestamp');
    } else if (sort === 'systemName') {
        view.applySort((item1, item2) => {
            if (
                item1.params.StarSystem.toLowerCase() ===
                item2.params.StarSystem.toLowerCase()
            )
                return 0;
            if (
                item1.params.StarSystem.toLowerCase() >
                item2.params.StarSystem.toLowerCase()
            )
                return 1;
            if (
                item1.params.StarSystem.toLowerCase() <
                item2.params.StarSystem.toLowerCase()
            )
                return -1;
        });
    }

    return view;
}

module.exports = {
    name: 'aggregations',
    version: '1.0.0',
    description: `Methods for aggregation of data`,
    register: async (server, options) => {
        server.method('getLastKnownLocation', () => {
            const view = dynamicViewData(
                server,
                'lastKnownLocation',
                [
                    obj =>
                        [
                            'ApproachBody',
                            'Docked',
                            'FSDJump',
                            'SupercruiseEntry',
                            'SupercruiseExit'
                        ].includes(obj.event)
                ],
                'timestamp'
            );

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
                return null;
            }
            const { event, timestamp, params } = lastKnownLocation;
            return params;
        });

        server.method('getSystemJournal', options => {
            const { searchQuery, orderBy } = options;
            let { page, limit } = options;
            if (!page) {
                page = 1;
            }
            if (!limit) {
                limit = 50;
            }
            const find = [obj => obj.event === 'FSDJump'];
            if (searchQuery) {
                find.push(obj =>
                    obj.params.StarSystem.toLowerCase().includes(
                        searchQuery.toLowerCase()
                    )
                );
            }

            const view = dynamicViewData(
                server,
                'allFSDJumps',
                find,
                orderBy || 'timestamp'
            );

            let result = view.data();
            const totalRecords = result.length;

            if (searchQuery) {
                result = result.slice(0, limit);
            } else {
                result = result.slice((page - 1) * limit, page * limit);
            }
            return {
                totalRecords,
                result
            };
        });

        server.method('getSystemList', options => {
            const { searchQuery, orderBy } = options;
            let { page, limit } = options;
            if (!page) {
                page = 1;
            }
            if (!limit) {
                limit = 50;
            }

            const find = [obj => obj.event === 'FSDJump'];
            if (searchQuery) {
                find.push(obj =>
                    obj.params.StarSystem.toLowerCase().includes(
                        searchQuery.toLowerCase()
                    )
                );
            }

            const view = dynamicViewData(
                server,
                'allFSDJumps',
                find,
                orderBy || 'timestamp'
            );

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

            if (searchQuery) {
                result = result.slice(0, limit);
            } else {
                result = result.slice((page - 1) * limit, page * limit);
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
<<<<<<< HEAD
                .reduce((a, b) => (new Date(a.timestamp).getTime() > new Date(b.timestamp).getTime() ? a : b));
=======
                .reduce(
                    (a, b) =>
                        new Date(a.timestamp).getTime() >
                        new Date(b.timestamp).getTime()
                            ? a
                            : b
                );
>>>>>>> 0c1e67eb75943749a285bd871627a0a5234fbc80
            if (!lastLoadout) {
                return null;
            }
            const { event, timestamp, params } = lastLoadout;
            return params;
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
