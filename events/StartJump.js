const starTempScheme = require('../schemes/star-temperature');

const register = shared => ({
    event: 'StartJump',
    command: async event => {
        const { StarClass } = event;

        const star = await starTempScheme.getSchemeValue(StarClass);
        if (!star) {
            console.log(
                `We do not have a range for ${StarClass} at the moment, please submit an issue to https://github.com/tanepiper/elite-dangerous-hue-scripter/issues`
            );
            return `We do not have a range for ${StarClass} at the moment, please submit an issue to https://github.com/tanepiper/elite-dangerous-hue-scripter/issues`;
        }
        shared.setGlobal('currentStar', star);
        return 'OK';
    }
});

module.exports = register;
