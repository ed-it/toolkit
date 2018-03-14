const fs = require('fs');

module.exports = async function(marketFile) {
    try {
        const data = fs.readFileSync(marketFile);
        try {
            const result = JSON.parse(data.toString().trim());
            const byCategory = result.Items.reduce((reducer, line) => {
                if (!reducer[line.Category_Localised]) {
                    reducer[line.Category_Localised] = {
                        name: line.Category_Localised,
                        commodities: []
                    };
                }
                reducer[line.Category_Localised].commodities.push(line);
                return reducer;
            }, {});
            return {
                id: result.MarketID,
                timestamp: result.timestamp,
                systemName: result.StarSystem,
                stationName: result.StationName,
                results: byCategory
            };
        } catch (e) {
            throw e;
        }
    } catch (e) {
        throw e;
    }
};
