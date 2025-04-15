import { mount } from "cypress/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProjectPage from "../../src/pages/ProjectPage";
import "../../src/pages/ProjectPage.css";

const mountProjectPage = (initialEntries = [
  { pathname: "/projects/Project%20Name", state: { description: "A sample project description" } }
]) => {
  mount(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/projects/:project_name" element={<ProjectPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProjectPage Component Tests', () => {
  // Test 1: Verify decoded project title and description render correctly.
  it('displays the decoded project title and description', () => {
    mountProjectPage();
    cy.contains('Project Name').should('exist');
    cy.contains('A sample project description').should('exist');
  });

  // Test 2: Check sensor dropdown renders with placeholder option.
  it('renders sensor dropdown with placeholder option', () => {
    mountProjectPage();
    cy.get('#sensor-select')
      .should('exist')
      .find('option').first().should('contain.text', '-- Choose a Sensor --');
  });

  // Test 3: Populate sensor dropdown using API response.
  it('populates sensor dropdown with API data', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: [
        { sensor_name: "Sensor1" },
        { sensor_name: "Sensor2" }
      ]
    }).as('getSensors');
    
    mountProjectPage();
    cy.wait('@getSensors');

    cy.get('#sensor-select').find('option').should('have.length.greaterThan', 1);
    cy.get('#sensor-select').select('Sensor1').should('have.value', 'Sensor1');
  });

  // Test 4: Check that datetime inputs render and can be edited.
  it('renders and allows entering start and end times', () => {
    mountProjectPage();
    cy.get('input[type="datetime-local"]').should('have.length', 2);

    cy.get('input[type="datetime-local"]').first()
      .type('2023-01-01T00:00')
      .should('have.value', '2023-01-01T00:00');

      cy.get('input[type="datetime-local"]').last()
      .type('2023-01-01T01:00')
      .should('have.value', '2023-01-01T01:00');
  });

  // Test 5: Verify that when live mode is checked, the end time input is disabled.
  it('disables end time input when live mode is active', () => {
    mountProjectPage();
    cy.get('input[type="checkbox"]').check().should('be.checked');
    cy.get('input[type="datetime-local"]').last().should('be.disabled');
  });

  // Test 6: Render chart container in non-live mode when sensor, start time and end time are provided.
  it('renders chart container when sensor is selected and both times are provided', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: [
        { sensor_name: "Sensor1" },
        { sensor_name: "Sensor2" }
      ]
    }).as('getSensors');

    mountProjectPage();
    cy.wait('@getSensors');

    cy.get('#sensor-select').select('Sensor1').should('have.value', 'Sensor1');
    cy.get('input[type="datetime-local"]').first().type('2023-01-01T00:00');
    cy.get('input[type="datetime-local"]').last().type('2023-01-01T01:00');

    cy.get('.chart-container').should('exist');
  });

  // Test 7: Render chart container in live mode when sensor and start time are provided.
  it('renders chart container in live mode when sensor and start time are provided', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: [
        { sensor_name: "Sensor1" },
        { sensor_name: "Sensor2" }
      ]
    }).as('getSensors');

    mountProjectPage();
    cy.wait('@getSensors');

    cy.get('#sensor-select').select('Sensor1').should('have.value', 'Sensor1');
    cy.get('input[type="datetime-local"]').first().type('2023-01-01T00:00');

    cy.get('input[type="checkbox"]').check().should('be.checked');
    cy.get('.chart-container').should('exist');
  });

  // Test 8: Verify that changing data type selection updates its value.
  it('updates data type when selection changes', () => {
    mountProjectPage();
    cy.get('.data-selection select').should('have.value', 'humidity');
    cy.get('.data-selection select').select('temperature').should('have.value', 'temperature');
  });

  // Test 9: Handle API failure gracefully so that the dropdown only contains the placeholder.
  it('handles API failure gracefully for sensors dropdown', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 500,
    }).as('getSensorsFailure');

    mountProjectPage();
    cy.wait('@getSensorsFailure');
    cy.get('#sensor-select').find('option').should('have.length', 1);
  });
});
