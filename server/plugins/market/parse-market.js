const fs = require('fs');

module.exports = async function(marketFile) {
    try {
        const data = fs.readFileSync(marketFile);
        try {
            const result = JSON.parse(data.toString().trim());
            const byCategory = result.Items.reduce((reducer, line) => {
                if (!reducer[line.Category]) {
                    reducer[line.Category] = {
                        name: line.Category_Localised,
                        items: []
                    };
                }
                reducer[line.Category].items.push(line);
                return reducer;
            }, {});
            return {
                id: result.MarketID,
                timestamp: result.timestamp,
                system: result.StarSystem,
                station: result.StationName,
                results: byCategory
            };
        } catch (e) {
            throw e;
        }
    } catch (e) {
        throw e;
    }
};
