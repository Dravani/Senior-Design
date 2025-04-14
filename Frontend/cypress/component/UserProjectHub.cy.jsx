import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";

// Page & CSS
import UserProjectHub from "../../src/pages/UserProjectHub";
import "../../src/pages/UserProjectHub.css";

describe('UserProjectHub Page Tests', () => {
  // Wrap the component in MemoryRouter to support routing in tests
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <UserProjectHub />
      </MemoryRouter>
    );
  });

  // Test 1: Ensure the Proper Title and Welcome Message Exists
  it('Projects Title and Welcome Message Appear', () => {
    cy.get('.underline').should('contain.text', 'Projects');
    cy.contains("Welcome, User!").should('exist');
  });

  // Test 2: Toggle Create Project Menu by Clicking the Card
  it('shows create project menu when the card is clicked', () => {
    // Click the card which toggles the menu
    cy.get('.card').click();
    cy.contains("Create New Project!").should('be.visible');
    cy.get('input[placeholder="Project Name"]').should('exist');
    cy.get('input[placeholder="Project Description"]').should('exist');
    cy.contains("Create").should('exist');
  });

  // Test 3: Update Input Fields in the Create Project Menu
  it('updates project name and description inputs correctly', () => {
    // Open the menu
    cy.get('.card').click();
    // Type into the Project Name input
    cy.get('input[placeholder="Project Name"]')
      .type('New Project')
      .should('have.value', 'New Project');
    // Type into the Project Description input
    cy.get('input[placeholder="Project Description"]')
      .type('This is a test project')
      .should('have.value', 'This is a test project');
  });

  // Test 4: Prevent Navigation When Project Name is Empty
  it('does nothing when Create is clicked with an empty project name', () => {
    // Open the menu
    cy.get('.card').click();
    // Leave the project name empty; add only a description.
    cy.get('input[placeholder="Project Description"]').type('Some description');
    // Click the Create button
    cy.contains("Create").click();
    // The menu should remain visible because the project name is empty (according to the business logic)
    cy.contains("Create New Project!").should('be.visible');
  });
});
