#!/usr/bin/env node
require('dotenv').config();

const args = require('minimist')(process.argv.slice(2));
const interpolateRGB = require('interpolate-rgb');

const starColours = {
    // Main Sequence Stars
    O: { red: 155, green: 176, blue: 255, brightness: 254, saturation: 254 },
    B: { red: 170, green: 191, blue: 255, brightness: 254, saturation: 254 },
    A: { red: 202, green: 215, blue: 255, brightness: 254, saturation: 254 },
    F: { red: 248, green: 247, blue: 255, brightness: 254, saturation: 254 },
    G: { red: 255, green: 244, blue: 234, brightness: 254, saturation: 254 },
    K: { red: 255, green: 210, blue: 161, brightness: 254, saturation: 254 },
    M: { red: 255, green: 204, blue: 111, brightness: 190, saturation: 200 },
    L: { red: 255, green: 50, blue: 80, brightness: 150, saturation: 254 },
    T: { red: 148, green: 16, blue: 163, brightness: 254, saturation: 254 },
    Y: { red: 148, green: 16, blue: 163, brightness: 100, saturation: 254 },
    // Proto Stars
    TTS: { red: 255, green: 204, blue: 111, brightness: 150, saturation: 150 },
    AeBe: { red: 202, green: 215, blue: 255, brightness: 105, saturation: 150 },
    // Neutron Star
    N: { red: 155, green: 176, blue: 255, brightness: 254, saturation: 254, cycle: true },
    H: { red: 1, green: 1, blue: 1, brightness: 0, saturation: 0 },
    SupermassiveBlackHole: { red: 255, green: 255, blue: 255, brightness: 20, saturation: 5 },
    M_RedSuperGiant: { red: 255, green: 204, blue: 111, brightness: 254, saturation: 254 }
};

const createClient = require('../lib/create-client');
const rgbToXy = require('../lib/rgb-to-xy');

const client = createClient({ host: process.env.HUE_HUB_IP, username: process.env.HUE_HUB_USERNAME });

const init = async ({ red, green, blue, brightness, saturation }) => {
    try {
        const light = await client.lights.getById(2);
        console.log(light);
    
        light.brightness = brightness;
        light.xy = rgbToXy(red, green, blue);
        light.saturation = saturation;
        await client.lights.save(light);
    } catch (e) {
        throw e;
    }
};

const preInitLoop = ({ red, green, blue, brightness, saturation }) => {
    let outerLoop = 10;
    const runner = setInterval(async () => {
        const innerRunner = setInterval(async () => {
            const newColours = interpolateRGB([0, 0, 0], [red, green, blue], 10 / outerLoop);
            await init({ red: newColours[0], green: newColours[1], blue: newColours[2], brightness, saturation });
        }, 100);

        if (outerLoop === 0) {
            clearInterval(innerRunner);
            clearInterval(runner);
        }

        outerLoop--;
    }, 10000);
};

const loopColours = () => {
    let count = 0;
    let keys = Object.keys(starColours);
    const runner = setInterval(async () => {
        if (count === keys.length) {
            clearInterval(runner);
        }

        const star = starColours[keys[count]];
        count++;
        await init(star);
    }, 1500);
};

if (args._[0] === 'loop') {
    loopColours();
} else {
    const star = starColours[args._[0]];
    if (star) {
        init(star);
    }
}