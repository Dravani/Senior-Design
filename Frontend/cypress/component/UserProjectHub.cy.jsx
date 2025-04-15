import { mount } from "cypress/react";
import { MemoryRouter, Router } from "react-router-dom";

import UserProjectHub from "../../src/pages/UserProjectHub";
import "../../src/pages/UserProjectHub.css";

describe('UserProjectHub Page Tests', () => {

  // Test 1: Ensure the proper title and welcome message appear.
  it('Projects Title and Welcome Message Appear', () => {
    mount(
      <MemoryRouter>
        <UserProjectHub />
      </MemoryRouter>
    );
    cy.get('.underline').should('contain.text', 'Projects');
    cy.contains("Welcome, User!").should('exist');
  });

  // Test 2: Toggle Create Project Menu by clicking the card.
  it('shows create project menu when the card is clicked', () => {
    mount(
      <MemoryRouter>
        <UserProjectHub />
      </MemoryRouter>
    );
    // Click the card to open the create project menu.
    cy.get('.card').click();
    cy.contains("Create New Project!").should('be.visible');
    cy.get('input[placeholder="Project Name"]').should('exist');
    cy.get('input[placeholder="Project Description"]').should('exist');
    cy.contains("Create").should('exist');
  });

  // Test 3: Update Input Fields in the Create Project Menu.
  it('updates project name and description inputs correctly', () => {
    mount(
      <MemoryRouter>
        <UserProjectHub />
      </MemoryRouter>
    );
    cy.get('.card').click();
    cy.get('input[placeholder="Project Name"]')
      .type('New Project')
      .should('have.value', 'New Project');
    cy.get('input[placeholder="Project Description"]')
      .type('This is a test project')
      .should('have.value', 'This is a test project');
  });

  // Test 4: Prevent Navigation When Project Name is Empty.
  it('does nothing when Create is clicked with an empty project name', () => {
    mount(
      <MemoryRouter>
        <UserProjectHub />
      </MemoryRouter>
    );
    cy.get('.card').click();
    cy.get('input[placeholder="Project Description"]').type('Some description');
    cy.contains("Create").click();
    cy.contains("Create New Project!").should('be.visible');
  });

  // Test 5: Toggle Menu Off When Clicking the Card Twice.
  it('closes the create project menu when the card is clicked twice', () => {
    mount(
      <MemoryRouter>
        <UserProjectHub />
      </MemoryRouter>
    );

    cy.get('.card').click();
    cy.contains("Create New Project!").should('be.visible');
    cy.get('.card').click();
    cy.contains("Create New Project!").should('not.exist');
  });

  // Test 6: Prevent Navigation When Project Name is Whitespace Only.
  it('does nothing when Create is clicked with a whitespace-only project name', () => {
    mount(
      <MemoryRouter>
        <UserProjectHub />
      </MemoryRouter>
    );
    cy.get('.card').click();
    cy.get('input[placeholder="Project Name"]').type('   ');
    cy.get('input[placeholder="Project Description"]').type('Some description');
    cy.contains("Create").click();
    cy.contains("Create New Project!").should('be.visible');
  });

  // Test 7: Check that the project cards container is rendered.
  it('renders the project cards container', () => {
    mount(
      <MemoryRouter>
        <UserProjectHub />
      </MemoryRouter>
    );
    cy.get('.project-cards').should('exist');
  });

  //Test 8: Verify that the card displays the expected plus sign.
  it('displays a plus sign on the card', () => {
    mount(
      <MemoryRouter>
        <UserProjectHub />
      </MemoryRouter>
    );
    cy.get('.card .card-title').should('contain.text', '+');
  });
});