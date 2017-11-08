const rgbToHex = require('../server/views/helpers/rgbToHex');
const { expect } = require('chai');

describe('rgbToHex', () => {
    it('should convert a {r,g,b} object to hex', () => {
        expect(rgbToHex({ red: 255, green: 105, blue: 180 })).to.equal('#ff69b4');
    });

    it('should convert an array of [r,g,b] values', () => {
        expect(rgbToHex([255, 105, 180])).to.equal('#ff69b4');
    });
});
