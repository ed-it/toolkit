module.exports = error => {
    return (error && `${error.stack}`) || 'Guru Meditation Error: No error passed';
};
