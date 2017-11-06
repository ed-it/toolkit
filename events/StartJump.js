const ct = require('color-temperature');

const STAR_TYPES = {
    O: { kelvinRange: [25000, 40000], brightness: 254, saturation: 254 },
    B: { kelvinRange: [11000, 25000], brightness: 225, saturation: 225 },
    A: { kelvinRange: [7500, 11000], brightness: 200, saturation: 200 },
    F: { kelvinRange: [6000, 7500], brightness: 150, saturation: 150 },
    G: { kelvinRange: [5000, 6000], brightness: 127, saturation: 127 },
    K: { kelvinRange: [3500, 5000], brightness: 100, saturation: 150 },
    M: { kelvinRange: [2500, 3500], brightness: 100, saturation: 200 },
    L: { kelvinRange: [1300, 2500], brightness: 100, saturation: 215 },
    T: { kelvinRange: [500, 1300], brightness: 200, saturation: 150 },
    Y: { kelvinRange: [250, 500], brightness: 100, saturation: 254 },
    // Proto Stars
    TTS: { kelvinRange: [2500, 3500], brightness: 200, saturation: 200 },
    AeBe: { kelvinRange: [7500, 1100], brightness: 150, saturation: 150 },
    // // Neutron Star
    N: { kelvinRange: [25000, 40000], brightness: 254, saturation: 254, pulse: true }
    // H: { red: 1, green: 1, blue: 1, brightness: 0, saturation: 0 },
    // SupermassiveBlackHole: { red: 255, green: 255, blue: 255, brightness: 20, saturation: 5 },
    // M_RedSuperGiant: { red: 255, green: 204, blue: 111, brightness: 254, saturation: 254 }
};

const register = shared => ({
    event: 'StartJump',
    command: async event => {
        const { StarClass } = event;

        const star = STAR_TYPES[StarClass];
        if (!star) {
            return console.log(`We do not have a range for ${StarClass} at the moment, please submit an issue to https://github.com/tanepiper/elite-dangerous-hue-scripter/issues`);
        }

        const { brightness, saturation, kelvinRange, pulse } = star;
        const [lower, upper] = kelvinRange;

        const kelvin = Math.floor(Math.random() * (upper - lower + 1) + lower);
        const { red, green, blue } = ct.colorTemperature2rgb(kelvin);

        shared.setGlobal('currentStar', { colour: { red, green, blue }, brightness, saturation, pulse });
        return;
    }
});

module.exports = register;
