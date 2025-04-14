describe('Extensive Full Application E2E Tests', () => {

    // Runs once before all tests – clears storage and resets any state
    before(() => {
      localStorage.clear();
    });
  
    // 1. Home Page and Basic NavBar Visibility
    it('Loads the Home Page and displays the NavBar', () => {
      cy.visit('/');
      cy.get('.NavBar').should('be.visible');
    });
  
    // 2. Navigation on Non-Auth Pages – Sensors and Projects
    it('Navigates between non-auth pages and keeps NavBar visible', () => {
      // Home page should display NavBar
      cy.visit('/');
      cy.get('.NavBar').should('be.visible');
  
      // Navigate to Sensors page
      cy.get('.nav-link[href="/sensors"]').click();
      cy.location('pathname').should('eq', '/sensors');
      cy.get('.NavBar').should('be.visible');
  
      // Navigate to Projects page
      cy.get('.nav-link[href="/projects"]').click();
      cy.location('pathname').should('eq', '/projects');
      cy.get('.NavBar').should('be.visible');
    });
  
    // 3. Auth Pages Should Not Display the NavBar
    it('Hides NavBar on authentication pages', () => {
      // Login page
      cy.visit('/login');
      cy.get('.NavBar').should('not.exist');
  
      // Signup page
      cy.visit('/signup');
      cy.get('.NavBar').should('not.exist');
    });
  
    // 4. Extended Navigation and Refresh Behavior
    it('Maintains correct NavBar visibility through navigation and page refreshes', () => {
      // Visit Sensors page and refresh
      cy.visit('/sensors');
      cy.get('.NavBar').should('be.visible');
      cy.reload();
      cy.get('.NavBar').should('be.visible');
  
      // Visit Projects page and refresh
      cy.visit('/projects');
      cy.get('.NavBar').should('be.visible');
      cy.reload();
      cy.get('.NavBar').should('be.visible');
  
      // Visit Signup page and refresh
      cy.visit('/signup');
      cy.get('.NavBar').should('not.exist');
      cy.reload();
      cy.get('.NavBar').should('not.exist');
    });
  
    // 5. Authentication Flows: Login and Logout
    describe('Authentication Flows', () => {
  
      it('Logs in successfully and displays NavBar', () => {
        // Intercept a login API call if your app uses one
        cy.intercept('POST', '/api/login', {
          statusCode: 200,
          body: { token: "dummyToken", user: { email: "test@example.com" } },
        }).as('loginRequest');
  
        cy.visit('/login');
        cy.get('input[type="email"]').type("test@example.com");
        cy.get('input[type="password"]').type("password123");
        cy.get('button.auth-button').click();
        
        cy.wait('@loginRequest');
        // Expect redirection to Home (or another protected page) where the NavBar appears
        cy.location('pathname').should('eq', '/');
        cy.get('.NavBar').should('be.visible');
      });
  
      it('Logs out successfully and hides NavBar', () => {
        // Ensure we're on a page with NavBar (requires being logged in)
        cy.visit('/');
        cy.get('.NavBar').should('be.visible');
  
        // Click the logout link and check redirection to login
        cy.get('.logout-link').click();
        cy.location('pathname').should('eq', '/login');
        cy.get('.NavBar').should('not.exist');
      });
    });
  
    // 6. Sensor Readings Page Testing
    describe('Sensor Readings Page', () => {
      it('Displays the live sensor readings page correctly', () => {
        // Visit a sensor readings page for a given sensor (e.g., "TestSensor")
        cy.visit('/readings/TestSensor');
        cy.contains('Live Sensor Readings for:').should('exist');
        cy.contains('TestSensor').should('exist');
        // Check for the waiting message (since live data may not be immediately available)
        cy.contains('Waiting for updates...').should('exist');
      });
    });
  
    // 7. Project Page Testing – Ensure the chart appears
    describe('Project Page', () => {
      it('Displays project information and renders a chart', () => {
        // Visit a project page for a dummy project ("TestProject")
        cy.visit('/projects/TestProject');
        cy.contains('TestProject').should('be.visible');
        // Verify that a chart (canvas element) is present on the page
        cy.get('canvas').should('exist');
      });
    });
  
    // 8. Invalid Route Handling (Optional)
    describe('Invalid Route Handling', () => {
      it('Displays a 404 page or redirects for an invalid route', () => {
        cy.visit('/non-existent-route', { failOnStatusCode: false });
        // Depending on your app, check for a "Page Not Found" message or redirection
        cy.contains('Page Not Found').should('exist');
        // Alternatively, if your app redirects to home:
        // cy.location('pathname').should('eq', '/');
      });
    });
  
    // 9. Additional Navigation Edge-Cases
    describe('Navigation Edge-Cases', () => {
      it('Navigates using browser back and forward buttons correctly', () => {
        cy.visit('/');
        cy.get('.nav-link[href="/sensors"]').click();
        cy.location('pathname').should('eq', '/sensors');
        
        // Navigate forward to projects
        cy.get('.nav-link[href="/projects"]').click();
        cy.location('pathname').should('eq', '/projects');
  
        // Use browser back button to return to sensors
        cy.go('back');
        cy.location('pathname').should('eq', '/sensors');
        cy.get('.NavBar').should('be.visible');
  
        // Use browser forward to go back to projects
        cy.go('forward');
        cy.location('pathname').should('eq', '/projects');
      });
    });
  });
  