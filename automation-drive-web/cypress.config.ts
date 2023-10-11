import { defineConfig } from 'cypress';
const dotenvPlugin = require('cypress-dotenv')


const BASE_URL = 'https://staging.drive.internxt.com/';
const config = defineConfig({
  defaultCommandTimeout: 12000,
  viewportHeight: 1080,
  viewportWidth: 1920,
  watchForFileChanges: false,
  chromeWebSecurity: false,
  
  e2e: {
    
    specPattern: ['cypress/e2e/**/*.cy.{js,jsx,ts,tsx,}'],
    baseUrl: BASE_URL,
    setupNodeEvents(on, config) {
      config = dotenvPlugin(config)
      return config
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    },
  },
});

export default config;
