const register = shared => ({
    event: 'Touchdown',
    command: async event => {
        const lights = await shared.hub.lights.getAll();

        lights.map(async light => {
            light.on = true;
            light.alert = 'lselect';
            light.effect = 'none';
            light.brightness = 254;
            light.saturation = 254;
            light.xy = shared.h.rgbToXy(shared.h.colours.GREEN);
            await shared.hub.lights.save(light);
            await shared.h.sleep(2000);
            await shared.h.setLightToCurrentStar();
        });
    }
});

module.exports = register;
