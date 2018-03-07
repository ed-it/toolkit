const register = shared => ({
    event: 'Materials',
    command: async event => {
        try {
            console.log(event);
            shared.setGlobal('materials', event);
        } catch (error) {
            throw error;
        }
    }
});

module.exports = register;
