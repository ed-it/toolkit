module.exports = (values, labels) => {
    return values.map((value, index) => `${labels[index]}: ${value}`).join(',')
}
