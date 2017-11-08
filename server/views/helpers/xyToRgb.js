const { cieToRgb } = require('../../../lib/cie_rgb_converter');

module.exports = light => {
    return cieToRgb(light.xy[0], light.xy[1], light.brightness);
};
