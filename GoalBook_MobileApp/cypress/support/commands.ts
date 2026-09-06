/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      mockApiRoutes(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('mockApiRoutes', () => {
  cy.intercept('GET', '**/books', { fixture: 'books.json' }).as('getBooks');
  cy.intercept('GET', '**/books/book-e2e-1', {
    body: {
      success: true,
      data: {
        id: 'book-e2e-1',
        title: 'Deep Work',
        author: 'Cal Newport',
        pages: 304,
        currentPage: 12,
        progressPercent: 4,
      },
    },
  }).as('getBookDetail');

  cy.intercept('PATCH', '**/books/*/progress', {
    statusCode: 200,
    body: { success: true },
  }).as('updateProgress');

  cy.intercept('POST', '**/chat/completions', {
    fixture: 'aiChat.json',
  }).as('askAI');
});

Cypress.Commands.add('login', (email = 'reader@goalbook.app', password = 'password123') => {
  window.localStorage.setItem('goalbook_auth_token', 'mock_e2e_jwt_token');
  window.localStorage.setItem(
    'goalbook_user_profile',
    JSON.stringify({
      id: 'e2e-user-1',
      name: 'E2E Reader',
      email: email,
    })
  );
});

export {};
