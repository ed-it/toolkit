const register = shared => ({
    event: 'SupercruiseExit',
    command: async event => {
        const lights = await shared.hub.lights.getAll();

        if (event.BodyType === 'Planet') {
            lights.forEach(async (light, index) => {
                light.on = true;
                light.alert = 'none';
                light.effect = 'none';
                light.brightness = 120;
                light.saturation = 254;
                light.xy = shared.h.rgbToXy(shared.h.colours.WHITE);
                await shared.hub.lights.save(light);
                await shared.h.sleep(5000);
                await shared.h.setLightToCurrentStar();
            });
        }
    }
});

module.exports = register;
