const Store = require('immutable-data-store').Store;
const Observer = require('immutable-data-store').Observer;
const huejay = require('huejay');
const ct = require('color-temperature');
const rgbToXy = require('./rgb-to-xy');
const xyToRgb = require('./xy-to-rgb');
const switchLights = require('./switch-lights');

module.exports = async ({ config, args, root }) => {
    try {
        const hub = new huejay.Client(config.hub);
        const globals = {};

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
                resetToStarColor: async () => {

                    // Just default on a M class so we don't crash
                    const starValues = sharedState.getGlobal('starValues') || { kelvinRange: [2500, 3500], luminocity: [100, 200] };
                    
                    const lights = await sharedState.hub.lights.getAll();
            
                    const kelvin = Math.floor(Math.random() * (starValues.kelvinRange[1] - starValues.kelvinRange[0] + 1) + starValues.kelvinRange[0]);
                    const { red, green, blue } = ct.colorTemperature2rgb(kelvin);
            
                    lights.map(async light => {
                        light.on = true;
                        light.brightness = starValues.luminocity[0] || 254;
                        light.xy = sharedState.h.rgbToXy(red, green, blue);
                        light.saturation = starValues.luminocity[1] || 254;
                        light.alert = 'none';
                        light.effect = 'none';
                        await sharedState.hub.lights.save(light);
                        await sharedState.h.sleep(5000);
                        light.alert = 'none';
                        await sharedState.hub.lights.save(light);
                    });
                }
            },
            setConfig: (newConf) => sharedState.config = newConf,
            setGlobal: (k, v) => (globals[k] = v),
            getGlobal: k => globals[k]
        };

        return sharedState;
    } catch (e) {
        throw e;
    }
};
