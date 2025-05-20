const { Client } = require("@googlemaps/google-maps-services-js");

async function getLatLng(address) {
  try {
    const client = new Client({});
    const response = await client.geocode({
      params: {
        address: address,
        key: "AIzaSyCPvqufzr4XJBYjtsMKiKdK6kgC2dCwnmI",
      },
    });

    if (!response.data.results.length) {
      throw new Error("No results found for this address");
    }

    const { lat, lng } = response.data.results[0].geometry.location;
    return { lat, lng };
  } catch (error) {
    console.error(
      "Geocoding error:",
      error.response?.data?.error_message || error.message
    );
    return null;
  }
}

// Usage (wrapped in async IIFE)
(async () => {
  const coords = await getLatLng("KB Prasac Pouk, Siem Reap, Cambodia");
  console.log(coords);
})();
