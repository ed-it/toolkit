#!/usr/bin/env node

require('dotenv').config();

const createClient = require('../lib/create-client');

const client = createClient({ host: process.env.HUE_HUB_IP, username: process.env.HUE_HUB_USERNAME });

const init = async() => {
  try {
    const bridgeData = await client.bridge.get();
    console.log(bridgeData);
    // for (let key in bridgeData.attributes) {
    //   console.log(`${key}: ${bridgeData[key]}`);
    // }
  } catch (e) {
    throw e;
  }
}

init();
