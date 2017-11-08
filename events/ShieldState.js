const register = shared => ({
    event: 'ShieldState',
    command: async event => {
        const lights = await shared.hub.lights.getAll();

        const { ShieldsUp } = event;
        console.log(ShieldsUp);

        lights.map(async (light, index) => {
            light.on = true;
            light.alert = 'lselect';
            light.effect = 'none';
            light.brightness = 254;
            light.saturation = 254;
            light.transitiontime = 1;
            if (ShieldsUp) {
                light.xy = shared.h.rgbToXy(shared.h.colours.GREEN);
            } else {
                light.xy = shared.h.rgbToXy(shared.h.colours.RED);
            }
            await shared.hub.lights.save(light);
            await shared.h.sleep(2000);
            light.xy = shared.h.rgbToXy(shared.h.colours.BLUE);
            await shared.hub.lights.save(light);
            await shared.h.sleep(2000);
            await shared.h.setLightToCurrentStar();
        });
    }
});

module.exports = register;
