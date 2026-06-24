require('cypress-mochawesome-reporter/register');
require('./bugbank/commands');
require('./showtickets/commands');

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver') || err.message.includes('hydration')) {
    return false;
  }
});
