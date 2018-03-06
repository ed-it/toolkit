const fs = require('fs');
const Tail = require('tail').Tail;
const Path = require('path');
const glob = require('glob-promise');
const Opened = require('@ronomon/opened');
const Bounce = require('bounce');
const Nes = require('nes');

const VEHICLE_SHIP = 'Ship';
const VEHICLE_SRV = 'SRV';
const VEHICLE_FIGHTER = 'Fighter';

function parseFlags(flags) {
    let value;
    const status = {};

    value = 67108864; // In SRV
    if (flags >= value) {
        status.vehicle = VEHICLE_SRV;
        flags = flags - value;
    }

    value = 33554432; // In Fighter
    if (flags >= value) {
        status.vehicle = VEHICLE_FIGHTER;
        flags = flags - value;
    }

    value = 16777216; // In MainShip
    if (flags >= value) {
        status.vehicle = VEHICLE_SHIP;
        flags = flags - value;
    }

    value = 8388608; // Being Interdicted
    if (flags >= value) {
        status.being_interdicted = true;
        flags = flags - value;
    }

    value = 4194304; // IsInDanger
    if (flags >= value) {
        status.in_danger = true;
        flags = flags - value;
    }

    value = 2097152; // Has Lat Long
    if (flags >= value) {
        status.near_surface = true;
        flags = flags - value;
    }

    value = 1048576; // Over Heating ( > 100% ), same as the 'Heat warning' event, so no new event is needed
    if (flags >= value) {
        status.overheating = true;
        flags = flags - value;
    }

    value = 524288; // Low Fuel ( < 25% )
    if (flags >= value) {
        status.low_fuel = true;
        flags = flags - value;
    }

    value = 262144; // FSD Cooldown
    if (flags >= value) {
        status.fsd_status = 'cooldown';
        flags = flags - value;
    }
    // if (EDDI.Instance.LastStatus.fsd_status == 'cooldown' && EDDI.Instance.CurrentStatus.fsd_status != 'cooldown') {
    //     status.fsd_status = 'cooldown complete';
    // }

    value = 131072; // FSD Charging
    if (flags >= value) {
        status.fsd_status = 'charging';
        flags = flags - value;
    }
    // if (EDDI.Instance.LastStatus.fsd_status == 'charging' && EDDI.Instance.CurrentStatus.fsd_status != 'charging') {
    //     status.fsd_status = 'charging complete';
    // }

    value = 65536; // FSD MassLocked
    if (flags >= value) {
        status.fsd_status = 'masslock';
        flags = flags - value;
    }
    // if (EDDI.Instance.LastStatus.fsd_status == 'masslock' && EDDI.Instance.CurrentStatus.fsd_status != 'masslock') {
    //     status.fsd_status = 'masslock cleared';
    // }

    value = 32768; // Srv DriveAssist
    if (flags >= value) {
        status.srv_drive_assist = true;
        flags = flags - value;
    }

    value = 16384; // Srv UnderShip
    if (flags >= value) {
        status.srv_under_ship = true;
        flags = flags - value;
    }

    value = 8192; // Srv Turret
    if (flags >= value) {
        status.srv_turret_deployed = true;
        flags = flags - value;
    }

    value = 4096; // Srv Handbrake
    if (flags >= value) {
        status.srv_handbrake_activated = true;
        flags = flags - value;
    }

    value = 2048; // Scooping Fuel
    if (flags >= value) {
        status.scooping_fuel = true;
        flags = flags - value;
    }

    value = 1024; // Silent Running
    if (flags >= value) {
        status.silent_running = true;
        flags = flags - value;
    }

    value = 512; // Cargo Scoop Deployed
    if (flags >= value) {
        status.cargo_scoop_deployed = true;
        flags = flags - value;
    }

    value = 256; // LightsOn
    if (flags >= value) {
        status.lights_on = true;
        flags = flags - value;
    }

    value = 128; // In Wing
    if (flags >= value) {
        status.in_wing = true;
        flags = flags - value;
    }

    value = 64; // Hardpoints Deployed
    if (flags >= value) {
        status.hardpoints_deployed = true;
        flags = flags - value;
    }

    value = 32; // FlightAssist Off
    if (flags >= value) {
        status.flight_assist_off = true;
        flags = flags - value;
    }

    value = 16; // Supercruise
    if (flags >= value) {
        status.supercruise = true;
        flags = flags - value;
    }

    value = 8; // Shields Up
    if (flags >= value) {
        status.shields_up = true;
        flags = flags - value;
    }

    value = 4; // Landing Gear Down
    if (flags >= value) {
        status.landing_gear_down = true;
        flags = flags - value;
    }

    value = 2; // Landed, (on planet surface)
    if (flags >= value) {
        status.landed = true;
        flags = flags - value;
    }

    value = 1; // Docked, (on a landing pad)
    if (flags >= value) {
        status.docked = true;
        flags = flags - value;
    }

    return status;
}

module.exports = {
    name: 'status-reader',
    version: '1.0.0',
    register: async (server, options) => {
        await server.register(Nes);
        server.subscription('/api/status');

        server.method('createStatusStream', statusFile => {
            server.log(['debug'], 'Creating Status');
            //const logStream = new Tail(statusFile, { fromBeginning: true, useWatchFile: true });
            const logStream = fs.watchFile(statusFile, (curr, prev) => {
                const data = fs.readFileSync(statusFile);
                if (!data) {
                    server.log[('warning', 'No Data')];
                }
                let result;
                try {
                    result = JSON.parse(data.toString());
                } catch (e) {
                    console.error(e);
                }
                const { event, ...params } = result;

                const [sys, eng, wep] = params.Pips;
                const flags = params.Flags;
                const status = parseFlags(flags);

                server.publish('/api/status', { event, pips: { sys, eng, wep, raw: params.Pips }, status });
                //server.methods.triggerEvent({ event, params });
            });
        });

        server.route({
            method: 'GET',
            path: '/status',
            handler: async (request, h) => {
                try {
                    const { config } = request.server.app;
                    return h.view(`status/views/status`, config);
                } catch (error) {
                    request.log(['error'], error);
                    Bounce.rethrow(error, 'system');
                    return h.view('shared/templates/error', { error });
                }
            }
        });

        // server.route({
        //     method: 'GET',
        //     path: '/api/status',
        //     config: {
        //         id: 'status',
        //         handler: (request, h) => {

        //             return 'world!';
        //         }
        //     }
        // })

        const init = async () => {
            try {
                const { directory } = server.app.config.log;
                const logPath = Path.resolve(directory);
                server.log(['debug'], 'Status Plugin');
                const statusFile = Path.join(logPath, 'Status.json');
                console.log(statusFile);
                return server.methods.createStatusStream(statusFile);
            } catch (error) {
                server.log(['error'], error);
                Bounce.rethrow(error, 'system');
            }
        };

        init();
    }
};
