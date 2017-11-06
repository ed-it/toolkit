const ct = require('color-temperature');

const register = shared => ({
    event: 'FSDJump',
    command: async event => {
        await shared.h.resetToStarColor();
    }
});

module.exports = register;
