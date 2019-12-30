const withCSS = require("@zeit/next-css");

module.exports = withCSS({
  enDemandEntries: {
    maxInactivePage: 15 * 60 * 1000, // 15 minutes
    pagesBufferLength: 6,
  },
});
