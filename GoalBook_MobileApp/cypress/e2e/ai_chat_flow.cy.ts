describe('AI Assistant Chat Flow E2E', () => {
  beforeEach(() => {
    cy.login();
    cy.mockApiRoutes();
  });

  it('interacts with AI Reading Assistant and receives generated answers', () => {
    cy.visit('/main/ai');

    // Verify AI Chat header & welcome message
    cy.contains(/AI Reading Assistant|GoalBook AI/i).should('be.visible');

    // Input prompt into chat input
    cy.get('input, textarea').last().type('What are the key themes of Deep Work?{enter}');

    // Mock API call should trigger
    cy.wait('@askAI');

    // Assert that AI response content appears
    cy.contains(/Deep work is the ability to focus/i).should('be.visible');

    // Verify quick action chips are rendered
    cy.contains('Summarize Rule #1: Work Deeply').should('be.visible');

    // Click quick action suggestion
    cy.contains('Summarize Rule #1: Work Deeply').click();
    cy.wait('@askAI');
  });
});
