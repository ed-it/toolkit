const rgbToXy = require('../lib/rgb-to-xy');

const colourSchemes = {
    'Core Dynamics': { red: 254, green: 0, blue: 254 },
    'Faulcon DeLacy': { red: 0, green: 254, blue: 0 },
    'Empire Gutamaya': { red: 0, green: 0, blue: 254 },
    'Lakon Spaceways': { red: 0, green: 254, blue: 254 },
    'Zorgon Peterson': { red: 254, green: 0, blue: 0 },
    'Saud Kruger': { red: 212, green: 175, blue: 55 }
};

const shipModels = {
    'Core Dynamics': ['Eagle', 'Federation_Dropship_MkII', 'Federation_Corvette', 'Federation_Dropship', 'Federation_Gunship', 'Vulture'],
    'Faulcon DeLacy': ['Anaconda', 'SideWinder', 'CobraMkIII', 'CobraMkIV', 'Python', 'Viper', 'Viper_MkIV'],
    'Empire Gutamaya': ['Empire_Trader', 'Empire_Courier', 'Empire_Eagle', 'Cutter'],
    'Lakon Spaceways': ['Asp', 'Asp_Scout', 'DiamondBackXL', 'DiamondBack', 'Independant_Trader', 'Type6', 'Type7', 'Type9'],
    'Zorgon Peterson': ['Adder', 'FerDeLance', 'Hauler'],
    'Saud Kruger': ['Dolphin', 'Orca', 'BelugaLiner']
};

const register = shared => ({
    event: 'Loadout',
    command: async event => {
        const { Ship } = event;

        const result = Object.keys(shipModels).find(maker => {
            return shipModels[maker].find(ship => {
                return Ship.toLowerCase() === ship.toLowerCase();
            });
        });
        const scheme = colourSchemes[result];
        if (!scheme) {
            console.log(`Unable to find scheme for ${Ship}::${result}`)
        }

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
