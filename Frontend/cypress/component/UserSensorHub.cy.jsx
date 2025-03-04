// Imports
import React from "react";
import { mount } from "cypress/react";

// Page & CSS
import UserSensorHub from '../../src/pages/UserSensorHub'
import '../../src/pages/UserSensorHub.css'

describe('UserSensorHub Page Tests', () => {
  // Mount the Component
  beforeEach(() => {
    mount(<UserSensorHub/>)
  });

  // Tests:
  // Test 1: Ensure the Proper Title Exists 
  it('Active Sensors Title Appears', () =>{
    cy.get('.underline').should('contain.text','Active Sensors');
  });

  // Test 2: Check that the table Titles Load
  it('Table Headers Load Properly', () => {
    cy.get('th').contains('Name');
    cy.get('th').contains('Status');
    cy.get('th').contains('Duration');
  });

});