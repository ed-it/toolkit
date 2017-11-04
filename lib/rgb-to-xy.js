module.exports = (red, green, blue) => {
    const redVal = red > 0.04045 ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : red / 12.92;
    const greenVal = green > 0.04045 ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : green / 12.92;
    const blueVal = blue > 0.04045 ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : blue / 12.92;

    const X = redVal * 0.664511 + greenVal * 0.154324 + blueVal * 0.162028;
    const Y = redVal * 0.283881 + greenVal * 0.668433 + blueVal * 0.047685;
    const Z = redVal * 0.000088 + greenVal * 0.07231 + blueVal * 0.986039;

    const x = X / (X + Y + Z);
    const y = Y / (X + Y + Z);

    return [x, y];
};
