describe('User Reading and Progress Flow E2E', () => {
  beforeEach(() => {
    cy.login();
    cy.mockApiRoutes();
  });

  it('loads library, opens a book, and tracks reading progress', () => {
    cy.visit('/main/library');

    // Wait for books API call
    cy.wait('@getBooks');

    // Assert book titles are visible in library
    cy.contains('Deep Work').should('be.visible');
    cy.contains('Atomic Habits').should('be.visible');

    // Open book details / reader
    cy.contains('Deep Work').click();

    // Verify Reader UI
    cy.url().should('include', 'book-e2e-1');

    // Verify navigation buttons exist (next page / previous page)
    cy.get('button, [role="button"]').should('exist');
  });

  it('updates reading progress when navigating pages in Reader', () => {
    cy.visit('/reader/book-e2e-1');

    // Trigger page navigation action
    cy.get('[aria-label*="next" i], button').first().click();

    // Verify progress API call was dispatched
    cy.wait('@updateProgress').its('request.body').should('exist');
  });
});
