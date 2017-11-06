module.exports = async hubClient => async command => {
    try {
        const lights = await hubClient.lights.getAll();
        lights.forEach(async light => {
            if (command) {
                light.on = command === 'on' ? true : false;
            } else {
                light.on = !light.state.attributes.on;
            }
            await hubClient.lights.save(light);
        });
    } catch (e) {
        throw e;
    }
};
