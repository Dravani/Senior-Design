// NavBar Testing
describe('NavBar Behavior Testing', () => {
  
  // Test 1: NavBar Appears On Proper Pages (No Auth)
  it('NavBar Appears on Non-Auth Pages', () => {
    // NavBar exisits upon load
    cy.visit("http://localhost:5173");
    cy.get('.NavBar').should('be.visible');

    // Navigate to Sensors
    cy.get('.nav-link[href="/sensors"]').click();
    cy.get('.NavBar').should('be.visible');

    // Navigate to Projects
    cy.get('.nav-link[href="/projects"]').click();
    cy.get('.NavBar').should('be.visible');
  });

  // Test 2: NavBar DOES NOT Appear On Proper Pages
  it('NavBar Does Not Appear on Auth Pages', () => {
    // NavBar Not on Login
    cy.visit("http://localhost:5173/login");
    cy.get('.NavBar').should('not.exist');

    // NavBar Not on Signup
    cy.visit("http://localhost:5173/signup");
    cy.get('.NavBar').should('not.exist');
  });

  // Test 3: NavBar Disappears When Navigating to Proper Pages
  it('NavBar Dissappears on Nav to Login', () => {
    cy.visit("http://localhost:5173");
    cy.get('.NavBar').should('be.visible');

    cy.visit("http://localhost:5173/signup");
    cy.get('.NavBar').should('not.exist');
  });
});