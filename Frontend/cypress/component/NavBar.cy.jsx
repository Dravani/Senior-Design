import { mount } from "cypress/react";
import { BrowserRouter } from "react-router-dom";

// Component & CSS
import NavBar from "../../src/components/NavBar";
import "../../src/components/NavBar.css";

describe('NavBar Component Tests', () => {
  // Mount the component before each test
  beforeEach(() => {
    // Clear localStorage for a clean state unless overridden later
    localStorage.clear();
    mount(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );
  });

  // Test 1: Ensure the NavBar Appears with proper links
  it('Navbar Appears', () => {
    cy.get('.NavBar').should('be.visible');
    cy.get('.nav-link[href="/sensors"]').should('exist');
    cy.get('.nav-link[href="/readings"]').should('exist');
    cy.get('.nav-link[href="/projects"]').should('exist');
    cy.get('.nav-link[href="/settings"]').should('exist');
    cy.get('.logout-link').should('exist');
  });

  // Test 2: Clicking Home Navigates to Sensor URL
  it('Clicking Home Navigates to Sensor URL', () => {
    cy.get('.nav-link[href="/sensors"]').click();
    cy.location('pathname').should('eq', '/sensors');
  });

  // Test 3: Clicking Plus Navigates to Readings URL when a sensor exists
  it('Clicking Plus Navigates to Readings URL when sensor exists', () => {
    // Set a sensor in localStorage so that NavBar has a sensor to navigate with
    localStorage.setItem("selectedSensors", JSON.stringify(["TestSensor"]));
    // Re-mount the component to pick up the localStorage value
    mount(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );
    // Click on the plus icon.
    // We select the element by targeting the nav icon with title "Readings" and clicking its parent span.
    cy.get('.nav-icon[title="Readings"]').parent().click({ force: true });
    cy.location('pathname').should('eq', '/readings/TestSensor');
  });

  // Test 4: Clicking Plus triggers alert when no sensor exists
  it('Clicking Plus triggers alert when no sensor exists', () => {
    // Ensure localStorage is cleared so no sensor exists
    localStorage.removeItem("selectedSensors");
    mount(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );
    // Listen for the alert message
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Currently not reading sensors');
    });
    // Click the plus icon (Readings)
    cy.get('.nav-icon[title="Readings"]').parent().click({ force: true });
  });

  // Test 5: Clicking Data Navigates to Projects URL
  it('Clicking Data Navigates to Projects URL', () => {
    cy.get('.nav-link[href="/projects"]').click();
    cy.location('pathname').should('eq', '/projects');
  });

  // Test 6: Clicking Gear Navigates to Settings URL
  it('Clicking Gear Navigates to Settings URL', () => {
    cy.get('.nav-link[href="/settings"]').click();
    cy.location('pathname').should('eq', '/settings');
  });

  // Test 7: Clicking Logout Navigates to Login URL
  it('Clicking Logout Navigates to Login URL', () => {
    cy.get('.logout-link').click();
    cy.location('pathname').should('eq', '/login');
  });

  // Additional Test: Verify that all navigation icons have the correct titles
  it('All navigation icons have appropriate titles', () => {
    cy.get('.nav-link[href="/sensors"] .nav-icon')
      .should('have.attr', 'title', 'Sensors');
    cy.get('.nav-icon[title="Readings"]')
      .should('exist'); // Readings icon exists on the plus button
    cy.get('.nav-link[href="/projects"] .nav-icon')
      .should('have.attr', 'title', 'Projects');
    cy.get('.nav-link[href="/settings"] .nav-icon')
      .should('have.attr', 'title', 'Settings');
  });
});
