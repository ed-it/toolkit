const register = shared => ({
    event: 'Liftoff',
    command: async event => {
        const lights = await shared.hub.lights.getAll();

        lights.map(async light => {
            light.on = true;
            light.alert = 'lselect';
            light.effect = 'none';
            light.brightness = 254;
            light.saturation = 254;
            light.xy = shared.h.rgbToXy(0, 254, 0);
            await shared.hub.lights.save(light);
            await shared.h.sleep(5000);
            await shared.h.resetToStarColor();
        });
    }
});

module.exports = register;
