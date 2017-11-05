#!/usr/bin/env node

process.on('unhandledRejection', err => {
    /*eslint-disable */
    console.log(err.stack);
    process.exit(1);
    /*eslint-enable */
});

process.on('uncaughtException', error => {
    /*eslint-disable */
    console.log(error.stack); // to see your exception details in the console
    process.exit(1);
    /*eslint-enable */
});

require('dotenv').config();

const leapjs = require('leapjs');
const controller = new leapjs.Controller({ enableGestures: true });

const createClient = require('../lib/create-client');
const rgbToXy = require('../lib/rgb-to-xy');
const XyToRgb = require('../lib/xy-to-rgb');

const client = createClient({ host: process.env.HUE_HUB_IP, username: process.env.HUE_HUB_USERNAME });

let updatingLights = false;

const triggerSave = async l => await client.lights.save(l);

controller.on('deviceFrame', async frame => {
    // loop through available gestures

    try {
        const hand = frame.hands[0];
        const position = hand && hand.palmPosition;
        const velocity = hand && hand.palmVelocity;
        const direction = hand && hand.direction;
        if (position && !updatingLights) {
            updatingLights = true;
            setTimeout(async () => {
                try {
                    const light = await getLight();
                    const [x, y, z] = [Math.floor(Math.random() * 254), Math.floor(Math.random() * 254), Math.floor(Math.random() * 254)];
                    console.log(x, y, z);
                    light.xy = rgbToXy(x, y, x);
                    updatingLights = false;
                    console.log('Updating Lights');
                    return await client.lights.save(light);
                } catch (e) {
                    throw e;
                }
            }, 100);
        }
    } catch (e) {
        throw e;
    }
});

const getLight = async () => {
    try {
        const light = await client.lights.getById(2);
        return light;
    } catch (e) {
        throw e;
    }
};

const init = async () => {

    controller.connect();
    try {

        const light = await client.lights.getById(2);
        light.xy = rgbToXy(255, 0, 0);
        await client.lights.save(light);
    } catch (e) {
        throw e;
    }
};

init();
