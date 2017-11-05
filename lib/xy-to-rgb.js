module.exports = (x, y, z, brightness) => {
    const zVal = 1.0 - x - y;

    const Y = brightness; // The given brightness value
    const X = (Y / y) * x;
    const Z = (Y / y) * z;

    let rVal =  X * 1.656492 - Y * 0.354851 - Z * 0.255038;
    let gVal = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
    let bVal =  X * 0.051713 - Y * 0.121364 + Z * 1.011530;

    rVal = rVal <= 0.0031308 ? 12.92 * rVal : (1.0 + 0.055) * Math.pow(rVal, (1.0 / 2.4)) - 0.055;
    gVal = gVal <= 0.0031308 ? 12.92 * gVal : (1.0 + 0.055) * Math.pow(gVal, (1.0 / 2.4)) - 0.055;
    bVal = bVal <= 0.0031308 ? 12.92 * bVal : (1.0 + 0.055) * Math.pow(bVal, (1.0 / 2.4)) - 0.055;

    return [rVal, gVal, bVal];
}