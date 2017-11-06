require('dotenv').config();
const expect = require('chai').expect;

const createHub = require('../lib/create-hub');
const Loadout = require('./HeatWarning');

describe('Loadout', async () => {
    let edHub;
    let loadoutInstance;

    before(() => {
        edHub = createHub();
        loadoutInstance = Loadout({ edHub });
    });

    it('should return the event type is supports', () => {
        expect(loadoutInstance.event).to.equal('HeatWarning');
    });

    it ('should change colour for event', async () => {
        await loadoutInstance.set({event: 'HeatWarning'});
    });
});
