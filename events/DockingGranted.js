const register = shared => ({
    event: 'DockingGranted',
    command: async event => {
        const lights = await shared.hub.lights.getAll();

        lights.map(async (light, index) => {
            light.on = true;
            light.alert = 'lselect';
            light.effect = 'none';
            light.brightness = 254;
            light.saturation = 254;

            if (index % 2 === 0) {
                light.xy = shared.h.rgbToXy(254, 0, 0);
            } else {
                light.xy = shared.h.rgbToXy(0, 254, 0);
            }
            await shared.hub.lights.save(light);
            await shared.h.sleep(10000);
            await shared.h.resetToStarColor();
        });
    }
});

module.exports = register;
