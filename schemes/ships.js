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

module.exports = {
    name: 'Ship Manufacturer scheme',
    event: 'Loadout',
    key: 'Ship',
    getSchemeValue: async ship => {
        const result = Object.keys(shipModels).find(maker =>
            shipModels[maker].find(s => ship.toLowerCase() === s.toLowerCase())
        );
        if (!result) {
            console.log(`Unable to find scheme for ${ship}`);
            throw new Error(`Unable to find scheme for ${ship}`);
        }
        const { colour } = colourSchemes[result];
        return { colour, brightness: 200, saturation: 200 };
    }
};
