require('dotenv').config();
const expect = require('chai').expect;

const createHub = require('../lib/create-hub');
const Loadout = require('./Loadout');

describe('Loadout', () => {
    let edHub;
    let loadoutInstance;

    before(() => {
        edHub = createHub();
        loadoutInstance = Loadout({ edHub });
    });

    it('should return the event type is supports', () => {
        expect(loadoutInstance.event).to.equal('Loadout');
    });

    it ('should change colour for event', async () => {
        await loadoutInstance.set({event: 'Loadout', Ship: 'Anaconda'});
    });

    it ('should change colour for event', async () => {
        await loadoutInstance.set({event: 'Loadout', Ship: 'Empire_Courier'});
    });
});
