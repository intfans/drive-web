import { defineConfig } from 'cypress';
import { downloadFile } from 'cypress-downloadfile/lib/addPlugin';


const BASE_URL = 'https://drive.internxt.com/';
const config = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  watchForFileChanges: false,
  chromeWebSecurity: false,
  e2e: {
    specPattern: ['cypress/e2e/**/*.cy.{js,jsx,ts,tsx,}'],
    baseUrl: BASE_URL,
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    },
  },
});

export default config;
