module.exports = (value1, value2) => {
    console.log(value1, value2);
    return `${value1}` === `${value2}` ? "checked" : "";
}
