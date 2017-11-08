module.exports = ({ red, green, blue }) => {
    return `#${[red, green, blue].map(colour => {
        const hex = colour.toString(16).toLowerCase();
        return hex.length == 1 ? `0${hex}` : hex;
    }).join('')}`;
};
