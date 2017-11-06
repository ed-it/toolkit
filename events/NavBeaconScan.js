const register = shared => ({
    event: 'NavBeaconScan',
    command: async event => {
        const lights = await shared.hub.lights.getAll();

        lights.map(async light => {
            light.on = true;
            light.alert = 'lselect';
            light.effect = 'none';
            light.brightness = 200;
            light.saturation = 200;
            light.xy = shared.h.rgbToXy(254, 254, 254);
            await shared.hub.lights.save(light);
            await shared.h.sleep(5000);
            await shared.h.resetToStarColor();
        });
    }
});

module.exports = register;
