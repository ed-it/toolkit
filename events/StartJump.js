const STAR_TYPES = {
    O: { kelvinRange: [25000, 40000], luminocity: [254, 254] },
    B: { kelvinRange: [11000, 25000], luminocity: [225, 225] },
    A: { kelvinRange: [7500, 11000], luminocity: [200, 200] },
    F: { kelvinRange: [6000, 7500], luminocity: [150, 150] },
    G: { kelvinRange: [5000, 6000], luminocity: [127, 127] },
    K: { kelvinRange: [3500, 5000], luminocity: [100, 150] },
    M: { kelvinRange: [2500, 3500], luminocity: [100, 200] },
    L: { kelvinRange: [1300, 2500], luminocity: [100, 215] },
    T: { kelvinRange: [500, 1300], luminocity: [200, 150] },
    Y: { kelvinRange: [250, 500], luminocity: [100, 254] },
    // Proto Stars
    TTS: { kelvinRange: [2500, 3500], luminocity: [200, 200] },
    AeBe: { kelvinRange: [7500, 1100], luminocity: [150, 150] },
    // // Neutron Star
    N: { kelvinRange: [25000, 40000], luminocity: [254, 254], pulse: true }
    // H: { red: 1, green: 1, blue: 1, brightness: 0, saturation: 0 },
    // SupermassiveBlackHole: { red: 255, green: 255, blue: 255, brightness: 20, saturation: 5 },
    // M_RedSuperGiant: { red: 255, green: 204, blue: 111, brightness: 254, saturation: 254 }
};

const register = (shared) => ({
    event: 'StartJump',
    command: async event => {
        const { StarClass } = event;

        const star = STAR_TYPES[StarClass];
        if (!star) {
            return console.log(`We do not have a range for ${StarClass} at the moment, please submit an issue to https://github.com/tanepiper/elite-dangerous-hue-scripter/issues`);
        }

        shared.setGlobal('starValues', star);
        return;
    }
});

module.exports = register;
