import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";

// Page & CSS
import UserSensorHub from "../../src/pages/UserSensorHub";
import "../../src/pages/UserSensorHub.css";

describe('UserSensorHub Page Tests', () => {

  // Test 1: Ensure the Proper Title Exists
  it('Active Sensors Title Appears', () => {
    mount(
      <MemoryRouter>
        <UserSensorHub />
      </MemoryRouter>
    );
    cy.get('.underline').should('contain.text', 'Active Sensors');
  });

  // Test 2: Check that the table headers load properly
  it('Table Headers Load Properly', () => {
    mount(
      <MemoryRouter>
        <UserSensorHub />
      </MemoryRouter>
    );
    cy.get('th').contains('Name');
    cy.get('th').contains('Status');
    cy.get('th').contains('Duration');
  });

  // Test 3: Displays sensor rows when sensors are returned from the API
  it('Displays sensor rows when sensors are available', () => {
    // Intercept the API call to return a list of sensors
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: [
        { sensor_name: "Sensor1" },
        { sensor_name: "Sensor2" }
      ]
    }).as('getSensors');

    mount(
      <MemoryRouter>
        <UserSensorHub />
      </MemoryRouter>
    );
    
    // Wait for the API call to complete
    cy.wait('@getSensors');
    
    // Ensure that the table has two sensor rows
    cy.get('tbody tr').should('have.length', 2);
    
    // Verify that the sensor links contain the correct text
    cy.get('a.sensor-link').first().should('contain.text', 'Sensor1');
    cy.get('a.sensor-link').last().should('contain.text', 'Sensor2');
  });

  // Test 4: Displays "No sensors available" when no sensors are returned
  it('Displays "No sensors available" when no sensors are returned', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: []
    }).as('getNoSensors');

    mount(
      <MemoryRouter>
        <UserSensorHub />
      </MemoryRouter>
    );

    cy.wait('@getNoSensors');
    
    // There should be one row with the "No sensors available" message
    cy.get('tbody tr').should('have.length', 1);
    cy.get('tbody tr td').should('contain.text', 'No sensors available');
  });

  // Test 5: Clicking on a sensor link updates localStorage with the sensor name
  it('Clicking on a sensor link updates local storage', () => {
    const mockSensors = [
      { sensor_name: "Sensor1" },
      { sensor_name: "Sensor2" }
    ];
    
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: mockSensors
    }).as('getSensors');

    // Clear localStorage before mounting the component
    localStorage.clear();

    mount(
      <MemoryRouter>
        <UserSensorHub />
      </MemoryRouter>
    );

    cy.wait('@getSensors');

    // Click on the first sensor link (Sensor1)
    cy.get('a.sensor-link').first().click();

    // Verify that localStorage now includes "Sensor1"
    cy.window().then((win) => {
      const stored = win.localStorage.getItem("selectedSensors");
      const sensors = JSON.parse(stored);
      expect(sensors).to.include("Sensor1");
    });
  });

  // --- Additional Tests ---

  // Test 6: Displays "No sensors available" when API fails (e.g., 500 error)
  it('Displays "No sensors available" when the API call fails', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 500,
    }).as('getSensorsFailure');

    mount(
      <MemoryRouter>
        <UserSensorHub />
      </MemoryRouter>
    );

    cy.wait('@getSensorsFailure');
    // With API failure, sensors remain empty, so table should show "No sensors available"
    cy.get('tbody tr').should('have.length', 1);
    cy.get('tbody tr td').should('contain.text', 'No sensors available');
  });

  // Test 7: Does not render sensors with null sensor_name
  it('Filters out sensors with null sensor_name', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: [
        { sensor_name: "Sensor1" },
        { sensor_name: null },
        { sensor_name: "Sensor2" },
      ]
    }).as('getSensorsWithNull');

    mount(
      <MemoryRouter>
        <UserSensorHub />
      </MemoryRouter>
    );

    cy.wait('@getSensorsWithNull');

    // Only two valid sensors should render (Sensor1 and Sensor2)
    cy.get('tbody tr').should('have.length', 2);
  });

  // Test 8: Filters duplicate sensor names so only unique sensors are rendered
  it('Filters out duplicate sensors', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: [
        { sensor_name: "Sensor1" },
        { sensor_name: "Sensor1" },
        { sensor_name: "Sensor2" },
        { sensor_name: "Sensor2" },
      ]
    }).as('getDuplicateSensors');

    mount(
      <MemoryRouter>
        <UserSensorHub />
      </MemoryRouter>
    );

    cy.wait('@getDuplicateSensors');

    // Only unique sensors should be rendered: Sensor1 and Sensor2 (i.e., 2 rows)
    cy.get('tbody tr').should('have.length', 2);
  });

  // Test 9: Verify each sensor link navigates to the correct URL
  it('Sensor links have correct href values based on sensor name', () => {
    const mockSensors = [
      { sensor_name: "SensorA" },
      { sensor_name: "SensorB" }
    ];
    
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: mockSensors,
    }).as('getSensors');

    mount(
      <MemoryRouter>
        <UserSensorHub />
      </MemoryRouter>
    );

    cy.wait('@getSensors');

    // Verify that each sensor link has the correct href, which should be /readings/{sensor_name}
    cy.get('a.sensor-link').eq(0)
      .should('have.attr', 'href', '/readings/SensorA');
    cy.get('a.sensor-link').eq(1)
      .should('have.attr', 'href', '/readings/SensorB');
  });
});