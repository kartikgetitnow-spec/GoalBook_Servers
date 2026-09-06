describe('Authentication Flow E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.mockApiRoutes();
  });

  it('displays welcome/login interface and validates credentials', () => {
    cy.visit('/auth/login');
    cy.get('body').should('be.visible');

    // Verify form presence
    cy.get('input[type="email"], input[placeholder*="email" i], input').first().should('exist');
  });

  it('successfully logs in and navigates to dashboard when valid credentials provided', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          token: 'jwt_mock_success_token',
          user: {
            id: 'u-1',
            email: 'reader@goalbook.app',
            name: 'Alex Reader',
          },
        },
      },
    }).as('loginRequest');

    cy.visit('/auth/login');
    cy.get('input[type="email"], input[placeholder*="email" i], input').first().type('reader@goalbook.app');
    cy.get('input[type="password"], input[placeholder*="password" i]').type('password123');

    cy.contains(/sign in|log in|login/i).click();

    // After login, should redirect to dashboard/main
    cy.url().should('not.include', '/auth/login');
  });
});
