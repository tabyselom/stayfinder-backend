const axios = require("axios");

const getLocationFromCoordinates = async (lat, lon) => {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
                params: {
                    format: "json",
                    lat,
                    lon
                },
                headers: {
                    "User-Agent": "qirbnb-app"
                }
            }
        );

        return response.data.display_name || null;

    } catch (error) {
        console.log("Geocoding error:", error.message);
        return null;
    }
};

module.exports = getLocationFromCoordinates;