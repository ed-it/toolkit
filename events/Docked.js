const register = shared => ({
    event: 'Docked',
    command: async event => {

        const lights = await shared.hub.lights.getAll();

        lights.forEach(async (light, index) => {
            light.on = true;
            light.alert = 'none';
            light.effect = 'none';
            light.brightness = 120;
            if (index % 2 === 0) {
                light.xy = shared.h.rgbToXy(254, 0, 0);
            } else {
                light.xy = shared.h.rgbToXy(0, 254, 0);
            }
            light.saturation = 254;
            await shared.hub.lights.save(light);
        });
    }
});

module.exports = register;
