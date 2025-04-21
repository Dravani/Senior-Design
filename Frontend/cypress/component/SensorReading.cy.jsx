import { mount } from "cypress/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import SensorReadings from "../../src/pages/SensorReadings";
import "../../src/pages/SensorReadings.css";

const mountSensorReadings = (sensorName = "Sensor1") => {
  mount(
    <MemoryRouter initialEntries={[`/readings/${sensorName}`]}>
      <Routes>
        <Route path="/readings/:sensor_name" element={<SensorReadings />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('SensorReadings Component Tests', () => {

  // Test 1: Render header with sensor name
  it('renders the header with the correct sensor name', () => {
    mountSensorReadings("Sensor1");
    cy.contains("Live Sensor Readings for:").should("exist");
    cy.get(".sensor-name").should("contain.text", "Sensor1");
  });

  // Test 2: When no reading is available, shows waiting message
  it('displays "Waiting for updates..." when no reading data exists', () => {
    mountSensorReadings("Sensor1");
    cy.contains("Waiting for updates...").should("exist");
  });

  // Test 3: Displays sensor status as "Enabled" when API returns no disabled flag
  it('displays sensor status as Enabled if sensor is not disabled', () => {
    cy.intercept("GET", "http://localhost:3000/api/sensors/disabled/Sensor1", {
      statusCode: 200,
      body: [] 
    }).as("getStatus");

    mountSensorReadings("Sensor1");
    cy.wait("@getStatus");
    cy.get(".sensor-toggle p").should("contain.text", "Enabled");
  });

  // Test 4: Displays sensor status as "Disabled" when API returns is_disabled true
  it('displays sensor status as Disabled if API returns sensor is disabled', () => {
    cy.intercept("GET", "http://localhost:3000/api/sensors/disabled/Sensor1", {
      statusCode: 200,
      body: [{ is_disabled: true }]
    }).as("getStatus");

    mountSensorReadings("Sensor1");
    cy.wait("@getStatus");
    cy.get(".sensor-toggle p").should("contain.text", "Disabled");
  });

  // Test 5: Clicking the toggle button sends POST and updates sensor status
  it('toggles sensor status when the toggle button is clicked', () => {
    cy.intercept("GET", "http://localhost:3000/api/sensors/disabled/Sensor1", {
      statusCode: 200,
      body: []  
    }).as("getStatus");
    cy.intercept("POST", "http://localhost:3000/api/sensors/disabled/Sensor1/toggle", {
      statusCode: 200,
      body: { is_disabled: true }
    }).as("postToggle");

    mountSensorReadings("Sensor1");
    cy.wait("@getStatus");
    cy.get(".sensor-toggle p").should("contain.text", "Enabled");

    cy.get("button.toggle-btn").click();
    cy.wait("@postToggle");
    cy.get(".sensor-toggle p").should("contain.text", "Disabled");
  });

  // Test 6: Renders navigation buttons if localStorage contains multiple sensors
  it('renders navigation buttons when there is more than one sensor', () => {
    localStorage.setItem("selectedSensors", JSON.stringify(["Sensor1", "Sensor2", "Sensor3"]));
    mountSensorReadings("Sensor2");

    cy.get(".navigation-buttons").should("contain.text", "Previous Sensor");
    cy.get(".navigation-buttons").should("contain.text", "Next Sensor");
  });

  // Test 7: Navigation buttons vary based on sensor position
  it('renders only Next for first sensor and only Previous for last sensor', () => {
    localStorage.setItem("selectedSensors", JSON.stringify(["Sensor1", "Sensor2", "Sensor3"]));
    mountSensorReadings("Sensor1");
    cy.get(".navigation-buttons").should("not.contain.text", "Previous Sensor");
    cy.get(".navigation-buttons").should("contain.text", "Next Sensor");

    mountSensorReadings("Sensor3");
    cy.get(".navigation-buttons").should("contain.text", "Previous Sensor");
    cy.get(".navigation-buttons").should("not.contain.text", "Next Sensor");
  });

  // Test 8: Sensor list renders correctly and excludes the current sensor
  it('displays sensor list excluding the current sensor', () => {
    localStorage.setItem("selectedSensors", JSON.stringify(["Sensor1", "Sensor2", "Sensor3"]));
    mountSensorReadings("Sensor2");
    cy.get(".sensor-list").should("exist");
    cy.get(".sensor-list li").should("have.length", 2);
    cy.get(".sensor-list li").each(($el) => {
      cy.wrap($el).should("not.contain.text", "Sensor2");
    });
  });

  // Test 9: Verify that sensor list links have the correct href values.
  it('ensures sensor list links have correct href attributes', () => {
    localStorage.setItem("selectedSensors", JSON.stringify(["Sensor1", "Sensor2", "Sensor3"]));
    mountSensorReadings("Sensor2");
    cy.get(".sensor-list li").first()
      .find("a").should("have.attr", "href", `/readings/${encodeURIComponent("Sensor1")}`);
    cy.get(".sensor-list li").last()
      .find("a").should("have.attr", "href", `/readings/${encodeURIComponent("Sensor3")}`);
  });
});
