const { rgbToHex } = require('../../../lib/colour-tools');

module.exports = colour => {
    const c = Array.isArray(colour)
        ? colour
              .map((c, i) => (i === 0 ? { red: c } : i > 0 && i == 2 ? { blue: c } : { green: c }))
              .reduce((reducer, value) => ({ ...reducer, ...value }), {})
        : colour;
    return rgbToHex(c);
};
