const huejay = require('huejay');

const BRIDGE_IP = '192.168.0.109';

const init = async() => {
  const clients = {

  }
  try {
    const bridges = await huejay.discover();
    for (let bridge of bridges) {
      console.log(`Id: ${bridge.id}, IP: ${bridge.ip}`);
    }
  } catch (e) {
    throw e;
  }
}

init();
