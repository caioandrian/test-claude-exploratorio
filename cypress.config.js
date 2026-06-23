const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'BugBank — Exploratório',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  e2e: {
    baseUrl: 'https://bugbank.netlify.app',
    defaultCommandTimeout: 6000,
    responseTimeout: 10000,
    pageLoadTimeout: 20000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    specPattern: 'cypress/e2e/**/*.cy.js',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});
