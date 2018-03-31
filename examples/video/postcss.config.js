const fontMagician = require("postcss-font-magician");

module.exports = {
  plugins: [
    fontMagician({
      variants: {
        Roboto: {
          "400": [],
          "400 italic": [],
          "700": []
        }
      }
    }),
  ]
};
