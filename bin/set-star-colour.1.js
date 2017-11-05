#!/usr/bin/env node
require('dotenv').config();

const args = require('minimist')(process.argv.slice(2));
const ct = require('color-temperature');

const createClient = require('../lib/create-client');
const rgbToXy = require('../lib/rgb-to-xy');

const client = createClient({ host: process.env.HUE_HUB_IP, username: process.env.HUE_HUB_USERNAME });

const init = async (kelvin = 1850, brightness = 254, saturation = 254) => {
    try {
        const light = await client.lights.getById(2);
        const colour = ct.colorTemperature2rgb(kelvin)
    
        light.brightness = brightness;
        light.xy = rgbToXy(colour.red, colour.green, colour.blue);
        light.saturation = saturation;
        await client.lights.save(light);
    } catch (e) {
        throw e;
    }
};

// const loopColours = () => {
//     let count = 0;
//     let keys = Object.keys(starColours);
//     const runner = setInterval(async () => {
//         if (count === keys.length) {
//             clearInterval(runner);
//         }

//         const star = starColours[keys[count]];
//         count++;
//         await init(star);
//     }, 1500);
// };

init(args._[0]);