// Imports
import React from "react";
import { mount } from "cypress/react";

// Page & CSS
import UserProjectHub from '../../src/pages/UserProjectHub'
import '../../src/pages/UserProjectHub.css'

describe('UserProjectHub Page Tests', () => {
  // Mount the Component
  beforeEach(() => {
    mount(<UserProjectHub/>)
  });

  // Tests:
  // Test 1: Ensure the Proper Title Exists 
  it('Projects Title Appears', () =>{
    cy.get('.underline').should('contain.text','Projects');
  });

});