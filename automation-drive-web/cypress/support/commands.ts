import { loginHelper } from './pages/loginPage';
require('cypress-downloadfile/lib/downloadFileCommand');
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
Cypress.Commands.add('Login', (email, password) => {
  //cy.session('Login',()=>{
  cy.visit('/');
  email && loginHelper.writeEmail(email);
  password && loginHelper.writePassword(password);
  loginHelper.clickSignIn();
  //})
});

//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
