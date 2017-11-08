module.exports = (value1, value2) => {
    if (Array.isArray(value1) || typeof value1 === 'string') {
        return value1.includes(value2);
    }

    const found = Object.keys(value1).find(key => key === value2);
    console.log(found);
    return !!found;
}
