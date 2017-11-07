const register = shared => ({
    event: 'Docked',
    command: async event => {
        const lights = await shared.hub.lights.getAll();

        lights.forEach(async (light, index) => {
            light.on = true;
            light.alert = 'none';
            light.effect = 'none';
            light.brightness = 120;
            light.saturation = 254;
            if (index % 2 === 0) {
                light.xy = shared.h.rgbToXy(shared.h.colours.RED);
            } else {
                light.xy = shared.h.rgbToXy(shared.h.colours.GREEN);
            }
            await shared.hub.lights.save(light);
        });
    }
});

module.exports = register;
