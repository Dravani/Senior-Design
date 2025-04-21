import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";
import UserProjectHub from "../../src/pages/UserProjectHub";
import "../../src/pages/UserProjectHub.css";

describe("UserProjectHub Page Tests", () => {
  beforeEach(() => {
    window.sessionStorage.setItem(
      "currentUser",
      JSON.stringify({ username: "User" })
    );

    cy.intercept("GET", "http://localhost:3000/api/projects*", {
      statusCode: 200,
      body: [], 
    }).as("getProjects");
  });

  const mountHub = () => {
    mount(
      <MemoryRouter>
        <UserProjectHub />
      </MemoryRouter>
    );
    cy.wait("@getProjects");
  };

  it("Projects Title and Welcome Message Appear", () => {
    mountHub();
    cy.get(".underline").should("contain.text", "Projects");
    cy.contains("Welcome, User!").should("exist");
  });

  it("shows create project menu when the New‑Project card is clicked", () => {
    mountHub();
    cy.get(".project-cards .card").first().click();
    cy.contains("Create New Project!").should("be.visible");
    cy.get('input[placeholder="Project Name"]').should("exist");
    cy.get('input[placeholder="Project Description"]').should("exist");
    cy.contains("Create").should("exist");
  });

  it("updates project name and description inputs correctly", () => {
    mountHub();
    cy.get(".project-cards .card").first().click();
    cy.get('input[placeholder="Project Name"]')
      .type("New Project")
      .should("have.value", "New Project");
    cy.get('input[placeholder="Project Description"]')
      .type("This is a test project")
      .should("have.value", "This is a test project");
  });

  it("does nothing when Create is clicked with an empty project name", () => {
    mountHub();
    cy.get(".project-cards .card").first().click();
    cy.get('input[placeholder="Project Description"]').type("Some description");
    cy.contains("Create").click();
    cy.contains("Create New Project!").should("be.visible");
  });

  it("closes the create project menu when the card is clicked twice", () => {
    mountHub();
    const card = cy.get(".project-cards .card").first();
    card.click();
    cy.contains("Create New Project!").should("be.visible");
    card.click();
    cy.contains("Create New Project!").should("not.exist");
  });

  it("does nothing when Create is clicked with a whitespace-only project name", () => {
    mountHub();
    cy.get(".project-cards .card").first().click();
    cy.get('input[placeholder="Project Name"]').type("   ");
    cy.get('input[placeholder="Project Description"]').type("Desc");
    cy.contains("Create").click();
    cy.contains("Create New Project!").should("be.visible");
  });

  it("renders the project cards container", () => {
    mountHub();
    cy.get(".project-cards").should("exist");
  });

  it("displays a plus sign on the New‑Project card", () => {
    mountHub();
    cy.get(".project-cards .card .card-title").first().should("contain.text", "+");
  });
});
