/**
 * Converts CIE color space to RGB color space
 * https://github.com/usolved/cie-rgb-converter
 * @param {object} light The light object
 * @param {Array} light.xy The XY value of the colour
 * @param {Number} light.brightness - Ranges from 1 to 254
 * @return {Array} Array that contains the color values for red, green and blue
 */
const xyToRgb = ({ xy, brightness = 254 }) => {
    const [x, y] = xy;
    const z = 1.0 - x - y;

    const Y = (brightness / 254).toFixed(2);
    const X = Y / y * x;
    const Z = Y / y * z;

    //Convert to RGB using Wide RGB D65 conversion
    let red = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
    let green = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
    let blue = X * 0.051713 - Y * 0.121364 + Z * 1.01153;

    //If red, green or blue is larger than 1.0 set it back to the maximum of 1.0
    if (red > blue && red > green && red > 1.0) {
        green = green / red;
        blue = blue / red;
        red = 1.0;
    } else if (green > blue && green > red && green > 1.0) {
        red = red / green;
        blue = blue / green;
        green = 1.0;
    } else if (blue > red && blue > green && blue > 1.0) {
        red = red / blue;
        green = green / blue;
        blue = 1.0;
    }

    //Reverse gamma correction
    red = red <= 0.0031308 ? 12.92 * red : (1.0 + 0.055) * Math.pow(red, 1.0 / 2.4) - 0.055;
    green = green <= 0.0031308 ? 12.92 * green : (1.0 + 0.055) * Math.pow(green, 1.0 / 2.4) - 0.055;
    blue = blue <= 0.0031308 ? 12.92 * blue : (1.0 + 0.055) * Math.pow(blue, 1.0 / 2.4) - 0.055;

    //Convert normalized decimal to decimal
    red = Math.round(red * 255);
    green = Math.round(green * 255);
    blue = Math.round(blue * 255);

    if (isNaN(red)) red = 0;

    if (isNaN(green)) green = 0;

    if (isNaN(blue)) blue = 0;

    return { red, green, blue };
};

/**
 * Converts RGB color space to CIE color space
 * https://github.com/usolved/cie-rgb-converter
 * @param {Number} red
 * @param {Number} green
 * @param {Number} blue
 * @return {Array} Array that contains the CIE color values for x and y
 */
const rgbToXy = ({ red, green, blue }) => {
    //Apply a gamma correction to the RGB values, which makes the color more vivid and more the like the color displayed on the screen of your device
    red = red > 0.04045 ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : red / 12.92;
    green = green > 0.04045 ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : green / 12.92;
    blue = blue > 0.04045 ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : blue / 12.92;

    //RGB values to XYZ using the Wide RGB D65 conversion formula
    const X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
    const Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
    const Z = red * 0.000088 + green * 0.07231 + blue * 0.986039;

    //Calculate the xy values from the XYZ values
    let x = (X / (X + Y + Z)).toPrecision(4);
    let y = (Y / (X + Y + Z)).toPrecision(4);

    if (isNaN(x)) x = 0;

    if (isNaN(y)) y = 0;

    return [parseFloat(x), parseFloat(y)];
};

const hexToRgb = hex => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => `${r}${r}${g}${g}${b}${b}`);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
          }
        : '';
};

const rgbToHex = ({ red, green, blue }) => {
    return `#${[red, green, blue]
        .map(colour => {
            const hex = colour.toString(16).toLowerCase();
            return hex.length == 1 ? `0${hex}` : hex;
        })
        .join('')}`;
};

module.exports = {
    xyToRgb,
    rgbToXy,
    hexToRgb,
    rgbToHex
};
