// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
  logging: true,

  intentMap: {
    'AMAZON.YesIntent': 'YesIntent',
    'AMAZON.NoIntent': 'NoIntent',
    'AMAZON.FallbackIntent': 'UnhandledIntent',
    'AMAZON.StopIntent': 'END',
  },

  db: {
    FileDb: {
      pathToFile: '../db/db.json',
    },
  },
};
