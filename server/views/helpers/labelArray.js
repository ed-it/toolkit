module.exports = (values, labels) => {
    console.log(labels);
    return values.map((value, index) => `${labels[index]}: ${value}`).join(',')
}
