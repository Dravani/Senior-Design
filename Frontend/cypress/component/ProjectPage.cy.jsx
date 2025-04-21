import { mount } from 'cypress/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProjectPage from '../../src/pages/ProjectPage';
import '../../src/pages/ProjectPage.css';

const mountProjectPage = (
  initialEntries = [
    {
      pathname: '/projects/123',
      state: {
        project_id: '123',
        project_name: 'Project Name',
        description: 'A sample project description',
      },
    },
  ]
) => {
  mount(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/projects/:project_id" element={<ProjectPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProjectPage Component Tests', () => {
  beforeEach(() => {
    window.sessionStorage.setItem(
      'currentUser',
      JSON.stringify({ username: 'test-user' })
    );

    cy.intercept('GET', 'http://localhost:3000/api/charts/project/123', {
      statusCode: 200,
      body: [],
    }).as('getCharts');

    cy.intercept('GET', 'http://localhost:3000/api/sensors', {
      statusCode: 200,
      body: [],
    }).as('getSensors');
  });

  it('displays the decoded project title and description', () => {
    mountProjectPage();
    cy.wait('@getCharts');
    cy.contains('Project Name').should('exist');
    cy.contains('A sample project description').should('exist');
  });

  it('renders sensor-type dropdown with placeholder option', () => {
    mountProjectPage();
    cy.wait('@getCharts');

    cy.contains('Add Chart').as('addBtn').click();
    cy.wait('@getSensors');

    cy.get('select').first()
      .find('option').first()
      .should('contain.text', 'Sensor Type');
  });

  it('populates sensor checkboxes with API data', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors', {
      statusCode: 200,
      body: [
        { sensor_name: 'Sensor1' },
        { sensor_name: 'Sensor2' },
      ],
    }).as('getSensors');

    mountProjectPage();
    cy.wait('@getCharts');

    cy.contains('Add Chart').as('addBtn').click();
    cy.wait('@getSensors');

    cy.get('.sensor-checkbox-item').should('have.length', 2);
    cy.get('.sensor-checkbox-item').first().should('contain.text', 'Sensor1');
  });

  it('renders and allows entering start and end times', () => {
    mountProjectPage();
    cy.wait('@getCharts');

    cy.contains('Add Chart').as('addBtn').click();
    cy.wait('@getSensors');

    cy.get('input[type="datetime-local"]').should('have.length', 2);
    cy.get('input[type="datetime-local"]').first()
      .type('2023-01-01T00:00')
      .should('have.value', '2023-01-01T00:00');
    cy.get('input[type="datetime-local"]').last()
      .type('2023-01-01T01:00')
      .should('have.value', '2023-01-01T01:00');
  });

  it('disables end time input when live mode is active', () => {
    mountProjectPage();
    cy.wait('@getCharts');

    cy.contains('Add Chart').as('addBtn').click();
    cy.wait('@getSensors');

    cy.contains('Live').find('input[type="checkbox"]')
      .check().should('be.checked');
    cy.get('input[type="datetime-local"]').last()
      .should('be.disabled');
  });

  it('renders chart container when sensor is checked and both times are provided', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors', {
      statusCode: 200,
      body: [
        { sensor_name: 'Sensor1' },
        { sensor_name: 'Sensor2' },
      ],
    }).as('getSensors');

    mountProjectPage();
    cy.wait('@getCharts');

    cy.contains('Add Chart').as('addBtn').click();
    cy.wait('@getSensors');

    cy.get('.sensor-checkbox-item input[type="checkbox"]').first()
      .check().should('be.checked');

    cy.get('input[type="datetime-local"]').first()
      .type('2023-01-01T00:00');
    cy.get('input[type="datetime-local"]').last()
      .type('2023-01-01T01:00');

    cy.get('.chart-container').should('exist');
  });

  it('renders chart container in live mode when sensor and start time provided', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors', {
      statusCode: 200,
      body: [{ sensor_name: 'Sensor1' }],
    }).as('getSensors');

    mountProjectPage();
    cy.wait('@getCharts');

    cy.contains('Add Chart').as('addBtn').click();
    cy.wait('@getSensors');

    cy.get('.sensor-checkbox-item input[type="checkbox"]')
      .check().should('be.checked');

    cy.get('input[type="datetime-local"]').first()
      .type('2023-01-01T00:00');
    cy.contains('Live').find('input[type="checkbox"]')
      .check();

    cy.get('.chart-container').should('exist');
  });

  it('updates data type when selection changes', () => {
    mountProjectPage();
    cy.wait('@getCharts');

    cy.contains('Add Chart').as('addBtn').click();
    cy.wait('@getSensors');

    cy.get('select').eq(1)
      .should('have.value', 'humidity')
      .select('temperature')
      .should('have.value', 'temperature');
  });

  it('handles API failure gracefully for sensors dropdown', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors', {
      statusCode: 500,
    }).as('getSensorsFail');

    mountProjectPage();
    cy.wait('@getCharts');

    cy.contains('Add Chart').as('addBtn').click();
    cy.wait('@getSensorsFail');

    cy.get('.sensor-checkbox-item').should('have.length', 0);
  });
});
