module.exports = (params) => {
    return {
        longLat: [params.Longitude, params.Latitude],
        altitude: params.Altitude,
        heading: params.Heading
    }
}
