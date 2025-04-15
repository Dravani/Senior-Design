// NavBar Behavior Testing - E2E
describe('NavBar Behavior Testing', () => {

  // Test 1: NavBar Appears on Proper Pages (No Auth)
  it('NavBar Appears on Non-Auth Pages', () => {
    // Visit the home page and check NavBar visibility
    cy.visit("http://localhost:5173");
    cy.get('.NavBar').should('be.visible');
    
    // Navigate to Sensors page
    cy.get('.nav-link[href="/sensors"]').click();
    cy.location("pathname").should("eq", "/sensors");
    cy.get('.NavBar').should('be.visible');

    // Navigate to Projects page
    cy.get('.nav-link[href="/projects"]').click();
    cy.location("pathname").should("eq", "/projects");
    cy.get('.NavBar').should('be.visible');
  });

  // Test 2: NavBar Does Not Appear on Auth Pages
  it('NavBar Does Not Appear on Auth Pages', () => {
    // Check that NavBar is not present on the Login page
    cy.visit("http://localhost:5173/login");
    cy.get('.NavBar').should('not.exist');

    // Check that NavBar is not present on the Signup page
    cy.visit("http://localhost:5173/signup");
    cy.get('.NavBar').should('not.exist');
  });

  // Test 3: NavBar Disappears on Navigation to Auth Pages
  it('NavBar Disappears when navigating to an Auth Page', () => {
    cy.visit("http://localhost:5173");
    cy.get('.NavBar').should('be.visible');

    // Navigate to Signup, where NavBar should vanish
    cy.visit("http://localhost:5173/signup");
    cy.get('.NavBar').should('not.exist');
  });

  // Test 4: Extended Navigation and Refresh Behavior
  it('Maintains correct NavBar visibility through navigation and page refreshes', () => {
    // Start on home page (NavBar visible)
    cy.visit("http://localhost:5173");
    cy.get('.NavBar').should('be.visible');

    // Navigate to Sensors page and then refresh
    cy.get('.nav-link[href="/sensors"]').click();
    cy.location("pathname").should("eq", "/sensors");
    cy.reload();
    cy.get('.NavBar').should('be.visible');

    // Navigate to Projects page, refresh, and verify NavBar remains visible
    cy.get('.nav-link[href="/projects"]').click();
    cy.location("pathname").should("eq", "/projects");
    cy.reload();
    cy.get('.NavBar').should('be.visible');

    // Finally, navigate to Signup (auth page), refresh, and verify NavBar stays hidden
    cy.visit("http://localhost:5173/signup");
    cy.reload();
    cy.get('.NavBar').should('not.exist');
  });

  // Test 5: Logout Navigation Redirection
  it('Clicking Logout navigates to Login page', () => {
    cy.visit("http://localhost:5173");
    // Ensure NavBar is visible on a non-auth page
    cy.get('.NavBar').should('be.visible');

    // Click the logout link and verify the URL changes to /login
    cy.get('.logout-link').click();
    cy.location("pathname").should("eq", "/login");
  });
});