require('dotenv').config();

const createHub = require('../lib/create-hub');
const HeatWarning = require('./../events/HeatWarning');

const edHub = createHub();
const loadoutInstance = HeatWarning({ edHub });

const init = async () => {
    await loadoutInstance.set();
};

init();
