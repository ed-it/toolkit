const huejay = require('huejay');

const clients = [];

module.export = (bridges) => {
  for (let bridge of bridges) {

    console.log(`Id: ${bridge.id}, IP: ${bridge.ip}`);
  }
}
