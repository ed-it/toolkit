const Store = require('immutable-data-store').Store;
const Observer = require('immutable-data-store').Observer;
const huejay = require('huejay');
const rgbToXy = require('./rgb-to-xy');
const xyToRgb = require('./xy-to-rgb');
const switchLights = require('./switch-lights');

module.exports = async ({ config, args, root }) => {
    try {
        const hub = new huejay.Client(config.hub);
        const globals = {
            currentStar: {},
            currentShip: {}
        };

        // This is not the final shared state, expect the events object to be added
        const sharedState = {
            root,
            config,
            args,
            hub,
            h: {
                rgbToXy,
                xyToRgb,
                switch: switchLights(hub),
                sleep: ms => {
                    return new Promise(resolve => setTimeout(resolve, ms));
                },
                setLightToCurrentStar: async () => {
                    // Just default on a M class so we don't crash
                    const { colour, brightness, saturation, pulse } = sharedState.getGlobal('currentStar');
                    const lights = await sharedState.hub.lights.getAll();
                    lights.map(async light => {
                        light.on = true;
                        light.brightness = brightness || 254;
                        light.xy = sharedState.h.rgbToXy(colour);
                        light.saturation = saturation || 254;
                        light.alert = pulse ? 'lselect' : 'none';
                        light.effect = 'none';
                        await sharedState.hub.lights.save(light);
                    });
                },
                setLightsToCurrentShip: async() => {
                    const { colour } = sharedState.getGlobal('currentShip');
                    const lights = await sharedState.hub.lights.getAll();
                    lights.map(async light => {
                        light.on = true;
                        light.brightness = 230;
                        light.saturation = 230;
                        light.xy = sharedState.h.rgbToXy(colour);
                        await sharedState.hub.lights.save(light);
                    });
                }
            },
            setConfig: newConf => (sharedState.config = newConf),
            setGlobal: (k, v) => (globals[k] = v),
            getGlobal: k => globals[k]
        };

        return sharedState;
    } catch (e) {
        throw e;
    }
};
