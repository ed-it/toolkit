module.exports = ({ red, green, blue }) => {
    const redRange = red / 255;
    const greenRange = green / 255;
    const blueRange = blue / 255;

    const redVal = redRange > 0.04045 ? Math.pow((redRange + 0.055) / (1.0 + 0.055), 2.4) : redRange / 12.92;
    const greenVal = greenRange > 0.04045 ? Math.pow((greenRange + 0.055) / (1.0 + 0.055), 2.4) : greenRange / 12.92;
    const blueVal = blueRange > 0.04045 ? Math.pow((blueRange + 0.055) / (1.0 + 0.055), 2.4) : blueRange / 12.92;

    const xPos = redVal * 0.664511 + greenVal * 0.154324 + blueVal * 0.162028;
    const yPos = redVal * 0.283881 + greenVal * 0.668433 + blueVal * 0.047685;
    const zPos = redVal * 0.000088 + greenVal * 0.07231 + blueVal * 0.986039;

    const x = parseFloat((xPos / (xPos + yPos + zPos)).toFixed(4));
    const y = parseFloat((yPos / (xPos + yPos + zPos)).toFixed(4));

    return [x, y];
};
