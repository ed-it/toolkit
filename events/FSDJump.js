const ct = require('color-temperature');

const register = shared => ({
    event: 'FSDJump',
    command: async event => {
        await shared.h.setLightToCurrentStar();
    }
});

module.exports = register;
