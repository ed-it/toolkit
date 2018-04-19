const fs = require('fs');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

module.exports = async function(marketFile) {
    try {
        const data = await readFileAsync(marketFile);
        try {
            const result = JSON.parse(data.toString().trim());

            const categories = result.Items.reduce((reducer, line) => {
                if (!reducer[line.Category_Localised]) {
                    reducer[line.Category_Localised] = []
                }
                reducer[line.Category_Localised].push(line);
                return reducer;
            }, {});
            return {
                event: 'Market',
                timestamp: result.timestamp,
                params: {
                    id: result.MarketID,
                    systemName: result.StarSystem,
                    stationName: result.StationName,
                    categoryKeys: Object.keys(categories),
                    categories
                }
            };
        } catch (e) {
            throw e;
        }
    } catch (e) {
        throw e;
    }
};
