const rgbToXy = require('../lib/rgb-to-xy');

const colourSchemes = {
    'Core Dynamics': { colour: { red: 254, green: 0, blue: 254 } },
    'Faulcon DeLacy': { colour: { red: 0, green: 254, blue: 0 } },
    'Empire Gutamaya': { colour: { red: 0, green: 0, blue: 254 } },
    'Lakon Spaceways': { colour: { red: 0, green: 254, blue: 254 } },
    'Zorgon Peterson': { colour: { red: 254, green: 0, blue: 0 } },
    'Saud Kruger': { colour: { red: 212, green: 175, blue: 55 } }
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
            console.log(`Unable to find scheme for ${Ship}::${result}`);
        }

        shared.setGlobal('currentShip', scheme);
        await shared.h.setLightsToCurrentShip();
    }
});

module.exports = register;
