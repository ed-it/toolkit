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
            currentStar: {
                colour: { red: 255, green: 255, blue: 255 },
                brightness: 150,
                saturation: 150
            },
            currentShip: {}
        };

        // This is not the final shared state, expect the events object to be added
        const sharedState = {
            root,
            config,
            args,
            hub,
            h: {
                colours: {
                    RED: { red: 255, green: 0, blue: 0 },
                    GREEN: { red: 0, green: 255, blue: 0 },
                    BLUE: { red: 0, green: 0, blue: 255 },
                    YELLOW: { red: 255, green: 255, blue: 0 },
                    PURPLE: { red: 255, green: 0, blue: 255 },
                    CYAN: { red: 0, green: 255, blue: 255 },
                    ORANGE: { red: 255, green: 131, blue: 0 },
                    WHITE: { red: 255, green: 255, blue: 255 }
                },
                rgbToXy,
                xyToRgb,
                switch: switchLights(hub),
                sleep: ms => {
                    return new Promise(resolve => setTimeout(resolve, ms));
                },
                setLightToCurrentStar: async () => {
                    // Just default on a M class so we don't crash
                    const { colour, brightness, saturation, pulse, effect, off } = sharedState.getGlobal('currentStar');
                    const lights = await sharedState.hub.lights.getAll();
                    lights.map(async light => {
                        light.on = (typeof off === 'boolean' && !!off) || true;
                        light.brightness = brightness || 254;
                        light.saturation = saturation || 254;

                        light.transitiontime = 1;
                        light.alert = pulse ? 'lselect' : 'none';
                        light.effect = effect ? 'colorloop' : 'none';

                        light.xy = sharedState.h.rgbToXy(colour);
                        await sharedState.hub.lights.save(light);
                        if (pulse) {
                            await sharedState.h.sleep(pulse * 1000);
                            light.alert = 'none';
                            light.effect = 'none';
                            await sharedState.hub.lights.save(light);
                        }
                        return 'OK';
                    });
                },
                setLightsToCurrentShip: async () => {
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
            setConfig: (state, newConf) => {
                state = Object.assign({}, state, newConf);
                return state;
            },
            setGlobal: (k, v) => (globals[k] = v),
            getGlobal: k => globals[k]
        };

        return sharedState;
    } catch (e) {
        throw e;
    }
};
