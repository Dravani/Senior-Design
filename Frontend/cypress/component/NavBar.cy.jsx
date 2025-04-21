import { mount } from "cypress/react";
import { BrowserRouter } from "react-router-dom";

import NavBar from "../../src/components/NavBar";
import "../../src/components/NavBar.css";

describe('NavBar Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    mount(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );
  });

  // Test 1: Verify the NavBar appears with all expected elements
  it('Navbar Appears with all expected elements', () => {
    cy.get('.NavBar').should('be.visible');

    cy.get('.nav-link[href="/sensors"]').should('exist');
    cy.get('.nav-link[href="/projects"]').should('exist');
    cy.get('.nav-link[href="/settings"]').should('exist');

    cy.get('.logout-link').should('exist');

    cy.get('.nav-items')
      .find('span')
      .find('.nav-icon')
      .find('title')
      .should('have.text', 'Readings');
  });

  // Test 2: Clicking the Sensors link navigates to /sensors
  it('Clicking Home navigates to Sensor URL', () => {
    cy.get('.nav-link[href="/sensors"]').click();
    cy.location('pathname').should('eq', '/sensors');
  });

  // Test 3: Clicking the Readings icon navigates correctly when a sensor exists
  it('Clicking Readings icon navigates to proper Readings URL when sensor exists', () => {
    localStorage.setItem("selectedSensors", JSON.stringify(["TestSensor"]));

    mount(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    cy.get('.nav-items')
      .find('span')
      .click({ force: true });
      cy.location('pathname').should('eq', '/readings/TestSensor');
  });

  // Test 4: Clicking the Readings icon triggers an alert when no sensor exists
  it('Clicking Readings icon triggers alert when no sensor exists', () => {
    localStorage.removeItem("selectedSensors");

    mount(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    cy.on('window:alert', (alertText) => {
      expect(alertText).to.equal('Currently not reading sensors');
    });

    cy.get('.nav-items')
      .find('span')
      .click({ force: true });
  });

  // Test 5: Clicking the Projects link navigates to /projects
  it('Clicking Data navigates to Projects URL', () => {
    cy.get('.nav-link[href="/projects"]').click();
    cy.location('pathname').should('eq', '/projects');
  });

  // Test 6: Clicking the Settings link navigates to /settings
  it('Clicking Gear navigates to Settings URL', () => {
    cy.get('.nav-link[href="/settings"]').click();
    cy.location('pathname').should('eq', '/settings');
  });

  // Test 7: Clicking the Logout link navigates to /login
  it('Clicking Logout navigates to Login URL', () => {
    cy.get('.logout-link').click();
    cy.location('pathname').should('eq', '/login');
  });

  // Test 8: Verify that all navigation icons have appropriate titles
  it('All navigation icons have appropriate titles', () => {
    cy.get('.nav-link[href="/sensors"] .nav-icon')
      .find('title')
      .should('have.text', 'Sensors');

    cy.get('.nav-link[href="/projects"] .nav-icon')
      .find('title')
      .should('have.text', 'Projects');

    cy.get('.nav-link[href="/settings"] .nav-icon')
      .find('title')
      .should('have.text', 'Settings');

    cy.get('.nav-items')
      .find('span')
      .find('.nav-icon')
      .find('title')
      .should('have.text', 'Readings');
  });
});