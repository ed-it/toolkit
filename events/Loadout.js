const rgbToXy = require('../lib/rgb-to-xy');

const colourSchemes = {
    'Core Dynamics': { red: 254, green: 0, blue: 254 },
    'Faulcon DeLacy': { red: 0, green: 254, blue: 0 },
    Gutamaya: { red: 0, green: 0, blue: 254 },
    'Lakon Spaceways': { red: 0, green: 254, blue: 254 },
    'Zorgon Peterson': { red: 254, green: 0, blue: 0 }
};

const shipModels = {
    'Core Dynamics': ['Eagle', 'F63 Condor', 'Federal Assault Ship', 'Federal Corvette', 'Federal Dropship', 'Federal Gunship', 'Vulture'],
    'Faulcon DeLacy': [{ type: 'Anaconda', label: 'Anaconda' }, 'Cobra MkIII', 'Cobra MkIV', 'Python', 'Sidewinder MkI', 'Viper MkIII', 'Viper MkIV'],
    Gutamaya: ['GU-97', 'Imperial Clipper', { type: 'Empire_Courier', label: 'Imperial Courier' }, 'Imperial Cutter', 'Imperial Eagle'],
    'Lakon Spaceways': [
        'Asp Explorer',
        'Asp Scout',
        'Diamondback Explorer',
        'Diamondback Scout',
        'Keelback',
        'Taipan Fighter',
        'Type-6 Transporter',
        'Type-7 Transporter',
        'Type-9 Heavy'
    ],
    'Zorgon Peterson': ['Adder', 'Fer-de-Lance', 'Hauler']
};

const register = (shared) => ({
    event: 'Loadout',
    command: async event => {
        const { Ship } = event;
        console.log(Ship);

        const result = Object.keys(shipModels).find(maker => {
            return shipModels[maker].find(ship => {
                return Ship === ship.type;
            });
        });
        const scheme = colourSchemes[result];

        const lights = await shared.hub.lights.getAll();
        lights.forEach(async light => {
            light.on = true;
            light.alert = 'none';
            light.effect = 'none';
            light.brightness = 240;
            light.xy = rgbToXy(scheme.red, scheme.green, scheme.blue);
            light.saturation = 254;
            await shared.hub.lights.save(light);
        });
    }
});

module.exports = register;
