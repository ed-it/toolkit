const loki = require('lokijs');
const Path = require('path');
const fs = require('fs');

module.exports = {
    name: 'log-importer',
    version: '1.0.0',
    description: `Import all existing logs into a single database.`,
    register: async (server, options) => {
        server.method('createDatabase', (name, dataObjectFn) => {
            return new Promise((resolve, reject) => {
                const db = new loki(name, {
                    autoload: true,
                    autoloadCallback: () => {
                        let entries = db.getCollection('items');
                        if (!entries) {
                            entries = db.addCollection('items');
                        }
                        dataObjectFn().forEach(item => {
                            if (!entries.findOne({ name: item.name })) {
                                entries.insert(item);
                            } else {
                                entries.update(item);
                            }
                        });
                        entries.commit();
                    },
                    autosave: true,
                    autosaveInterval: 4000
                });
                resolve(db);
            });
        });

        server.method('getAllLogLines', logFiles => {
            const entries = [];
            logFiles.forEach(log => {
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
            });
            return entries;
        });

        server.route({
            path: '/api/import-logs',
            method: 'get',
            handler: async (request, h) => {
                const { directory } = server.app.config.log;
                const logPath = Path.resolve(directory);
                const logs = await server.methods.getLogFiles(logPath);

                const allLogLines = server.methods.getAllLogLines(logs);

                const statistics = allLogLines
                    .filter(line => line.event === 'Statistics')
                    .reduce((reducer, line) => {
                        const { event, timestamp, ...params } = line;
                        // We store per day, so we may need to merge figures
                        const timeKey = Math.floor(
                            new Date(timestamp).getTime() / (1000 * 60 * 60)
                        );

                        if (reducer[timeKey]) {
                            Object.keys(reducer[timeKey]).forEach(key => {
                                Object.keys(reducer[timeKey][key]).forEach(
                                    item => {
                                        if (
                                            typeof reducer[timeKey][key][
                                                item
                                            ] === 'number'
                                        ) {
                                            reducer[timeKey][key][item] +=
                                                params[key][item];
                                        } else {
                                            reducer[timeKey][key][item] =
                                                params[key];
                                        }
                                    }
                                );
                            });
                        }

                        if (!reducer[timeKey]) {
                            reducer[timeKey] = { timestamp, ...params };
                        }
                        return reducer;
                    }, {});

                const locations = allLogLines
                    .filter(line => line.event === 'Location')
                    .map(location => {
                        const { timestamp, event, ...params } = location;
                        const result = {
                            timestamp,
                            //_params: params,
                            star: {
                                system: params.StarSystem,
                                position: params.StarPos,
                                population: params.Population,
                                security: {
                                    name: params.SystemSecurity,
                                    nameLocalised: params.SystemSecurity_Localised
                                }
                            }
                        }
                        if (params.Body) {
                            result.body = {
                                name: params.Body,
                                type: params.BodyType,
                                bodyId: params.BodyID
                            }
                        }
                        if (params.Docked === true) {
                            result.station = {
                                name: params.StationName,
                                type: params.StationType,
                                marketId: params.MarketID
                            }
                        }
                        return result;
                    });

                return { statistics, locations };
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
