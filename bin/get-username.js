#!/usr/bin/env node

const huejay = require('huejay');

const createUser = async bridge => {
    const { ip } = bridge;
    const client = new huejay.Client({ host: ip });

    const newUser = new client.users.User;
    newUser.device_type = 'edlm';

    return await client.users.create(newUser);
};

const init = async () => {
    try {
        const bridges = await huejay.discover();
        for (let bridge of bridges) {
            console.log(`Id: ${bridge.id}, IP: ${bridge.ip}, User: ${await createUser(bridge)}`);
        }
    } catch (e) {
        throw e;
    }
};

init();
