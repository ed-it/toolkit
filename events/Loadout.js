const register = shared => ({
    event: 'Loadout',
    command: async event => {
        const colourSchemes = {
            'Core Dynamics': { colour: shared.h.colours.BLUE },
            'Faulcon DeLacy': { colour: shared.h.colours.GREEN },
            'Empire Gutamaya': { colour: shared.h.colours.PURPLE },
            'Lakon Spaceways': { colour: shared.h.colours.YELLOW },
            'Zorgon Peterson': { colour: shared.h.colours.ORANGE },
            'Saud Kruger': { colour: shared.h.colours.RED }
        };

        const shipModels = {
            'Core Dynamics': [
                'Eagle',
                'Federation_Dropship_MkII',
                'Federation_Corvette',
                'Federation_Dropship',
                'Federation_Gunship',
                'Vulture'
            ],
            'Faulcon DeLacy': ['Anaconda', 'SideWinder', 'CobraMkIII', 'CobraMkIV', 'Python', 'Viper', 'Viper_MkIV'],
            'Empire Gutamaya': ['Empire_Trader', 'Empire_Courier', 'Empire_Eagle', 'Cutter'],
            'Lakon Spaceways': [
                'Asp',
                'Asp_Scout',
                'DiamondBackXL',
                'DiamondBack',
                'Independant_Trader',
                'Type6',
                'Type7',
                'Type9'
            ],
            'Zorgon Peterson': ['Adder', 'FerDeLance', 'Hauler'],
            'Saud Kruger': ['Dolphin', 'Orca', 'BelugaLiner']
        };

        const { Ship } = event;

        const result = Object.keys(shipModels).find(maker => {
            return shipModels[maker].find(ship => {
                return Ship.toLowerCase() === ship.toLowerCase();
            });
        });
        const scheme = colourSchemes[result];
        if (!scheme) {
            console.log(`Unable to find scheme for ${Ship}::${result}`);
            throw new Error(`Unable to find scheme for ${Ship}::${result}`);
        }

        shared.setGlobal('currentShip', scheme);
        return await shared.h.setLightsToCurrentShip();
    }
});

module.exports = register;
