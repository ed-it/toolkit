const { xyToRgb } = require('../../../lib/colour-tools');

module.exports = light => {
    return xyToRgb(light.xy[0], light.xy[1], light.brightness);
};
