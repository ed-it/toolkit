const loki = require('lokijs');
const Path = require('path');
const fs = require('fs');

module.exports = {
    name: 'log-importer',
    version: '1.0.0',
    description: `Import all existing logs into a single database.`,
    register: async (server, options) => {
        const db = new loki('db/log-entries.json', {
            autoload: true,
            autoloadCallback: () => {
                collection = db.getCollection('log-entries');
                if (!collection) {
                    collection = db.addCollection('log-entries');
                }
                return collection;
            },
            autosave: true,
            autosaveInterval: 5000
        });

        server.method('getAllLogLines', log => {
            const entries = [];
            const file = fs.readFileSync(log);
            const lines = `${file}`.split('\n');
            const parsed = lines.forEach(line => {
                try {
                    if (line) {
                        const p = JSON.parse(line);
                        entries.push(p);
                    }
                } catch (e) {
                    console.log(`Unable to parse line ${log} ${line}`);
                }
            });
            return entries;
        });

        async function lastFile(conf) {
            await server.methods.updateConfig(conf);
        }

        server.route({
            path: '/api/logs/bounties',
            method: 'get',
            handler: async (request, h) => {
                const pview = collection.addDynamicView('bounties');
                pview.applyWhere(obj => obj.event === 'Bounty');
                const results = pview.data();

                const result = results.reduce((reducer, line) => {
                    const { event, timestamp, params } = line;
                    // We store per day, so we may need to merge figures
                    const timeKey = Math.floor(new Date(timestamp).getTime() / (1000 * 60 * 60 * 24));
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
                    count: Object.keys(result).length,
                    result
                };
            }
        });

        server.route({
            path: '/api/import-logs',
            method: 'get',
            handler: async (request, h) => {
                const { eventType } = request.query;
                const { directory, lastFileSaved } = server.app.config.log;
                const logPath = Path.resolve(directory);

                let logs = await server.methods.getLogFiles(logPath);

                let indexOfLastImport = 0;
                if (lastFileSaved) {
                    indexOfLastImport = logs.findIndex(logFile => {
                        return logFile.includes(lastFileSaved);
                    });
                }

                const logsToImport = logs.splice(indexOfLastImport + 1, logs.length);

                if (logsToImport.length > 0) {
                    for (let log of logsToImport) {
                        const logName = log.split('/').pop();
                        console.log(logName, server.app.config.log.lastFileSaved);
                        if (logName === server.app.config.log.lastFileSaved) {
                            return;
                        }
                        const logLines = server.methods.getAllLogLines(log);

                        for (let line of logLines) {
                            const { event, timestamp, ...params } = line;
                            collection.insert({
                                event,
                                timestamp,
                                params,
                                logName
                            });
                        }
                        const conf = Object.assign({}, server.app.config, {
                            log: {
                                directory,
                                lastFileSaved: logName
                            }
                        });
                        await lastFile(conf);
                    }
                } else {
                    console.log('Skipping import');
                }

                const pview = collection.addDynamicView('stats');
                pview.applyWhere(obj => obj.event === eventType);
                const results = pview.data();

                return {
                    count: results.length,
                    results
                };

                // const statistics = allLogLines
                //     .filter(line => line.event === 'Statistics')
                //     .reduce((reducer, line) => {
                //         const { event, timestamp, ...params } = line;
                //         // We store per day, so we may need to merge figures
                //         const timeKey = Math.floor(
                //             new Date(timestamp).getTime() / (1000 * 60 * 60)
                //         );

                //         if (reducer[timeKey]) {
                //             Object.keys(reducer[timeKey]).forEach(key => {
                //                 Object.keys(reducer[timeKey][key]).forEach(
                //                     item => {
                //                         if (
                //                             typeof reducer[timeKey][key][
                //                                 item
                //                             ] === 'number'
                //                         ) {
                //                             reducer[timeKey][key][item] +=
                //                                 params[key][item];
                //                         } else {
                //                             reducer[timeKey][key][item] =
                //                                 params[key];
                //                         }
                //                     }
                //                 );
                //             });
                //         }

                //         if (!reducer[timeKey]) {
                //             reducer[timeKey] = { timestamp, ...params };
                //         }
                //         return reducer;
                //     }, {});

                // const locations = allLogLines
                //     .filter(line => line.event === 'Location')
                //     .map(location => {
                //         const { timestamp, event, ...params } = location;
                //         const result = {
                //             timestamp,
                //             //_params: params,
                //             star: {
                //                 system: params.StarSystem,
                //                 position: params.StarPos,
                //                 population: params.Population,
                //                 security: {
                //                     name: params.SystemSecurity,
                //                     nameLocalised: params.SystemSecurity_Localised
                //                 }
                //             }
                //         }
                //         if (params.Body) {
                //             result.body = {
                //                 name: params.Body,
                //                 type: params.BodyType,
                //                 bodyId: params.BodyID
                //             }
                //         }
                //         if (params.Docked === true) {
                //             result.station = {
                //                 name: params.StationName,
                //                 type: params.StationType,
                //                 marketId: params.MarketID
                //             }
                //         }
                //         return result;
                //     });

                // return { statistics, locations };
                // const commanders = await server.methods.createDatabase(
                //     'db/commanders.json',
                //     () => {
                //         const commanders = allLogLines.filter(
                //             line => line.event === 'Commander'
                //         );
                //         if (commanders && commanders.length > 0) {
                //             return commanders.map(commander => {
                //                 return { name: commander.Name };
                //             });
                //         }
                //         return [];
                //     }
                // );

                // function groupHour(value, index, array) {
                //     d = new Date(value['date']);
                //     d = Math.floor(d.getTime() / (1000 * 60 * 60));
                //     byday[d] = byday[d] || [];
                //     byday[d].push(value);
                // }

                // let currentShipId = 0;
                // let fuelscoop = allLogLines
                //     .filter(line =>
                //         ['FuelScoop', 'Loadout'].includes(line.event)
                //     )
                //     .reduce((reducer, line) => {
                //         console.log(line, currentShipId);
                //         if (line.event === 'Loadout') {
                //             currentShipId = line.ShipID
                //             console.log(currentShipId);
                //             if (!reducer[currentShipId]) {
                //                 reducer[currentShipId] = {};
                //             }
                //         }
                //         if (line.event === 'FuelScoop') {
                //             const key = Math.floor(
                //                 new Date(line.timestamp).getTime() /
                //                     (1000 * 60 * 60)
                //             );
                //             if (!reducer[currentShipId][key])
                //                 reducer[currentShipId][key] = { scooped: 0, total: 0 };
                //             reducer[currentShipId][key].scooped += line.Scooped;
                //             reducer[currentShipId][key].total += line.Total;
                //         }
                //         return reducer;
                //     }, {0: {}});
                // Object.keys(fuelscoop).map(ship => {
                //     const times = fuelscoop[ship];

                //     line.scooped = parseFloat(line.scooped.toFixed(2));
                //     line.total = parseFloat(line.total.toFixed(2));
                //     return line;
                // });

                // const materialDb = await server.methods.createDatabase(
                //     'db/materials.json',
                //     () => {
                //         const materials = allLogLines
                //             .filter(line => line.event === 'Materials')
                //             .pop();
                //         let output = [];
                //         const raw = materials.Raw.map(materal => {
                //             return {
                //                 name: materal.Name,
                //                 namei18n:
                //                     materal.Name_Localised ||
                //                     materal.Name.replace(/\b\w/g, l =>
                //                         l.toUpperCase()
                //                     ),
                //                 count: materal.Count,
                //                 type: 'raw'
                //             };
                //         });
                //         output = output.concat(raw);
                //         const manufactured = materials.Manufactured.map(
                //             materal => {
                //                 return {
                //                     name: materal.Name,
                //                     namei18n:
                //                         materal.Name_Localised ||
                //                         materal.Name.replace(/\b\w/g, l =>
                //                             l.toUpperCase()
                //                         ),
                //                     count: materal.Count,
                //                     type: 'manufactured'
                //                 };
                //             }
                //         );
                //         output = output.concat(manufactured);
                //         const encoded = materials.Encoded.map(materal => {
                //             return {
                //                 name: materal.Name,
                //                 namei18n:
                //                     materal.Name_Localised ||
                //                     materal.Name.replace(/\b\w/g, l =>
                //                         l.toUpperCase()
                //                     ),
                //                 count: materal.Count,
                //                 type: 'encoded'
                //             };
                //         });
                //         output = output.concat(encoded);
                //         return output;
                //     }
                // );
                //return fuelscoop;
            }
        });
    }
};
