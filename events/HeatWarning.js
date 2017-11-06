const register = ({ edHub }) => ({
    event: 'HeatWarning',
    set: async event => {
    
        const lights = await edHub.client.lights.getAll();

        for (let i = 0; i < 5; i++) {
            lights.forEach(async light => {
                light.on = true;
                light.brightness = 254;
                light.xy = edHub.rgbToXy(254, 0, 0);
                light.saturation = 254;
                await edHub.client.lights.save(light).then(async() => await edHub.sleep(process.env.TEST_BLINK || 2000));
            });
            await edHub.sleep(process.env.TEST_BLINK || 2000);

            lights.forEach(async light => {
                light.on = false;
                await edHub.client.lights.save(light).then(async() => await edHub.sleep(process.env.TEST_BLINK || 2000));
            });
        }
    }
});

module.exports = register;