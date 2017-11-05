const ct = require('color-temperature');

let nextStarValue = '';

const rgbToXy = require('../lib/rgb-to-xy');

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
    N: { red: 155, green: 176, blue: 255, brightness: 254, saturation: 254, cycle: true }
    // H: { red: 1, green: 1, blue: 1, brightness: 0, saturation: 0 },
    // SupermassiveBlackHole: { red: 255, green: 255, blue: 255, brightness: 20, saturation: 5 },
    // M_RedSuperGiant: { red: 255, green: 204, blue: 111, brightness: 254, saturation: 254 }
};

const setStarColor = async (hubClient, starClass, brightness = 127, saturation = 127) => {
    const starData = STAR_TYPES[starClass];
    if (!starData) {
        console.log(`Unknown star type ${starClass}`);
    }
    const lights = await hubClient.lights.getAll();
    const kelvin = Math.floor(Math.random() * (starData.kelvinRange[1] - starData.kelvinRange[0] + 1) + starData.kelvinRange[0]);
    const colour = ct.colorTemperature2rgb(kelvin);
    lights.forEach(async light => {
        light.brightness = starData.luminocity[0] || brightness;
        light.xy = rgbToXy(colour.red, colour.green, colour.blue);
        light.saturation = starData.luminocity[1] || saturation;
        await hubClient.lights.save(light);
    });
};

module.exports = {
    STAR_TYPES,
    setStarColor
}