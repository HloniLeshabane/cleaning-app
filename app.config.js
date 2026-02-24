// app.config.js takes precedence over app.json.
// Expo 49+ automatically loads .env files, so process.env.GOOGLE_MAPS_API_KEY is available here.
const appJson = require('./app.json');

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
    extra: {
      ...appJson.expo.extra,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },
};
