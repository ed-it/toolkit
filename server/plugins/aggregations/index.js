const loki = require('lokijs');
const Path = require('path');
const fs = require('fs');

module.exports = {
    name: 'aggregations',
    version: '1.0.0',
    description: `Import all existing logs into a single database.`,
    register: async (server, options) => {
        server.route({
            path: '/api/logs/last-known-location',
            method: 'get',
            handler: async (request, h) => {
                const pview = server.app.collection.addDynamicView('lastKnownSystem');
                pview.applyWhere(obj => ['ApproachBody', 'Docked', 'FSDJump', 'SupercruiseEntry', 'SupercruiseExit'].includes(obj.event));
                const results = pview.data();

                const lastKnownLocation = results.reduce(function(a, b) {
                    return new Date(a.timestamp).getTime() > new Date(b.timestamp).getTime() ? a : b;
                });

                return lastKnownLocation;
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
