const register = shared => ({
    event: 'DockSRV',
    command: async event => {
        const lights = await shared.hub.lights.getAll();

        lights.map(async (light, index) => {
            light.on = false;
            await shared.hub.lights.save(light);
            await shared.h.sleep(500);
            light.on = true;
            light.alert = 'none';
            light.effect = 'none';
            light.brightness = 254;
            light.saturation = 254;
            light.xy = shared.h.rgbToXy(shared.h.colours.ORANGE);
            await shared.hub.lights.save(light);
            await shared.h.sleep(2000);
            await shared.h.setLightToCurrentStar();
        });
    }
});

module.exports = register;