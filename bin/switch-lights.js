#!/usr/bin/env node
require('dotenv').config();

const args = require('minimist')(process.argv.slice(2));

const createClient = require('../lib/create-client');

const client = createClient({ host: process.env.HUE_HUB_IP, username: process.env.HUE_HUB_USERNAME });

const init = async (command) => {
    try {
        const lights = await client.lights.getAll();
        lights.forEach(async light => {
            light.on = command === 'on' ? true : false;
            await client.lights.save(light);
        });
    } catch (e) {
        throw e;
    }
};

init(args._[0]);
