// craco.config.js
const tailwindPostcss = require('@tailwindcss/postcss');
const autoprefixer   = require('autoprefixer');

module.exports = {
  style: {
    postcss: {
      plugins: [
        tailwindPostcss(),
        autoprefixer(),
      ],
    },
  },
};

  