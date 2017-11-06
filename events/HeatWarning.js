const register = shared => ({
    event: 'HeatWarning',
    command: async event => {
        const lights = await shared.hub.lights.getAll();

        lights.map(async (light, index) => {
            light.on = true;
            light.alert = 'lselect';
            light.effect = 'none';
            light.brightness = 254;
            light.saturation = 254;

            if (index % 2 === 0) {
                light.xy = shared.h.rgbToXy(shared.h.colours.RED);
            } else {
                light.xy = shared.h.rgbToXy(shared.h.colours.YELLOW);
            }
            
            await shared.hub.lights.save(light);
            await shared.h.sleep(5000);
            await shared.h.setLightToCurrentStar();
        });
    }
});

module.exports = register;
