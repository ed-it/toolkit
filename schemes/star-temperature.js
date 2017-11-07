const ct = require('color-temperature');
const rgbToXy = require('../lib/rgb-to-xy');

const STAR_TYPES = {
    O: { kelvinRange: [25000, 40000], brightness: 254, saturation: 254 },
    B: { kelvinRange: [11000, 25000], brightness: 225, saturation: 225 },
    A: { kelvinRange: [7500, 11000], brightness: 200, saturation: 200 },
    A_BlueWhiteSuperGiant: { kelvinRange: [7500, 11000], brightness: 254, saturation: 254 },
    F: { kelvinRange: [6000, 7500], brightness: 150, saturation: 150 },
    F_WhiteSuperGiant: { kelvinRange: [6000, 7500], brightness: 254, saturation: 254 },
    G: { kelvinRange: [5000, 6000], brightness: 127, saturation: 127 },
    K: { kelvinRange: [3500, 5000], brightness: 100, saturation: 150 },
    K_OrangeGiant: { kelvinRange: [3500, 5000], brightness: 254, saturation: 254 },
    M: { kelvinRange: [2500, 3500], brightness: 100, saturation: 200 },
    M_RedSuperGiant: { kelvinRange: [2500, 3500], brightness: 254, saturation: 254 },
    M_RedGiant: { kelvinRange: [2500, 3500], brightness: 200, saturation: 254 },
    L: { kelvinRange: [1300, 2500], brightness: 100, saturation: 215 },
    T: { kelvinRange: [500, 1300], brightness: 200, saturation: 150 },
    Y: { kelvinRange: [250, 500], brightness: 100, saturation: 254 },
    // Proto Stars
    TTS: { kelvinRange: [2500, 3500], brightness: 200, saturation: 200 },
    AeBe: { kelvinRange: [7500, 1100], brightness: 150, saturation: 150 },
    // Neutron Star
    N: { kelvinRange: [25000, 40000], brightness: 254, saturation: 254, pulse: 15 },
    // Black Hole
    H: { kelvinRange: [25000, 40000], brightness: 0, saturation: 0, off: true },
    SupermassiveBlackHole: { kelvinRange: [25000, 40000], brightness: 0, saturation: 0, off: true },
    // Exotic
    X: { kelvinRange: [25000, 40000], brightness: 254, saturation: 254, pulse: 15, effect: true },
    // RoguePlanet
    RoguePlanet: { kelvinRange: [100, 100], brightness: 100, saturation: 100, pulse: 2, effect: true },
    // Nebula
    Nebula: { kelvinRange: [2500, 10000], brightness: 190, saturation: 254, pulse: 10, effect: true },
    StellarRemnantNebula: { kelvinRange: [2500, 10000], brightness: 190, saturation: 254, pulse: 10, effect: true },
    // Wolf Raynet
    W: { kelvinRange: [30000, 200000], brightness: 200, saturation: 150, pulse: 5 },
    WN: { kelvinRange: [30000, 200000], brightness: 200, saturation: 150, pulse: 5 },
    WNC: { kelvinRange: [30000, 200000], brightness: 200, saturation: 150, pulse: 5 },
    WC: { kelvinRange: [30000, 200000], brightness: 200, saturation: 150, pulse: 5 },
    WO: { kelvinRange: [30000, 200000], brightness: 200, saturation: 150, pulse: 5 },
    // Carbon Stars
    CS: { kelvinRange: [30000, 200000], brightness: 200, saturation: 150, pulse: 5 },
    C: { kelvinRange: [30000, 200000], brightness: 200, saturation: 150, pulse: 5 },
    CN: { kelvinRange: [30000, 200000], brightness: 200, saturation: 150, pulse: 5 },
    CJ: { kelvinRange: [30000, 200000], brightness: 200, saturation: 150, pulse: 5 },
    CH: { kelvinRange: [30000, 200000], brightness: 200, saturation: 150, pulse: 5 },
    CHd: { kelvinRange: [30000, 200000], brightness: 200, saturation: 150, pulse: 5 },
    MS: { kelvinRange: [30000, 200000], brightness: 200, saturation: 150, pulse: 5 },
    S: { kelvinRange: [30000, 200000], brightness: 200, saturation: 150, pulse: 5 },
    // White Dwarfs
    D: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DA: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DAB: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DAO: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DAZ: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DAV: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DB: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DBZ: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DBV: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DO: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DOV: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DQ: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DC: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DCV: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 },
    DX: { kelvinRange: [100000, 150000], brightness: 254, saturation: 254, pulse: 15 }
};

module.exports = {
    event: 'StartJump',
    key: 'StarClass',
    getSchemeValue: async starKey => {
        let starData = STAR_TYPES[starKey];
        if (!starData) {
            console.log(`Unknown star type ${starClass}. Giving default G class scheme`);
            starData = STAR_TYPES.G;
        }
        const { kelvinRange, ...starParams } = starData;
        const kelvin = Math.floor(Math.random() * (kelvinRange[1] - kelvinRange[0] + 1) + kelvinRange[0]);
        const colour = ct.colorTemperature2rgb(kelvin);
        return { colour, ...starParams };
    }
};

// const setStarColor = async (hubClient, starClass, brightness = 127, saturation = 127) => {
//     const starData = STAR_TYPES[starClass];
//     if (!starData) {
//         console.log(`Unknown star type ${starClass}`);
//     }
//     const lights = await hubClient.lights.getAll();
//     const kelvin = Math.floor(
//         Math.random() * (starData.kelvinRange[1] - starData.kelvinRange[0] + 1) + starData.kelvinRange[0]
//     );
//     const colour = ct.colorTemperature2rgb(kelvin);
//     lights.forEach(async light => {
//         light.brightness = starData.luminocity[0] || brightness;
//         light.xy = rgbToXy(colour.red, colour.green, colour.blue);
//         light.saturation = starData.luminocity[1] || saturation;
//         await hubClient.lights.save(light);
//     });
// };

// module.exports = {
//     STAR_TYPES,
//     setStarColor
// };
