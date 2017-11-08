const shipScheme = require('../schemes/ships');

const register = shared => ({
    event: 'Loadout',
    condition: 'Ship',
    command: async event => {

        try {
            const scheme = await shipScheme.getSchemeValue(event.Ship);
            shared.setGlobal('currentShip', scheme);
            return await shared.h.setLightsToCurrentShip();
        } catch (error) {
            throw error;
        }
    }
});

module.exports = register;
