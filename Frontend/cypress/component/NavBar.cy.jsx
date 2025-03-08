// Imports
import React from "react";
import { mount } from "cypress/react";
import { BrowserRouter } from "react-router-dom";

// Component & CSS
import NavBar from "../../src/components/NavBar";
import '../../src/components/NavBar.css'

describe('NavBar Component Tests', () => {
    // Mount the Component -> Need Memory Router so Navbar can use context
    beforeEach(() => {
        mount(
            <BrowserRouter>
                <NavBar/>
            </BrowserRouter>
        )  
    });

    // Tests:
    // Test 1: Ensure the NavBar Appears
    it('Navbar Appears', () => {
        cy.get('.NavBar').should('be.visible');
        cy.get('.nav-link[href="/sensors"]');
        cy.get('.nav-link[href="/readings"]');
        cy.get('.nav-link[href="/projects"]');
        cy.get('.nav-link[href="/settings"]');
    });

    // Test 2: Navigate to Proper Sensors URL
    it('Clicking Home Navigates to Sensor URL', () => {
        cy.get('.nav-link[href="/sensors"]').click();
        cy.location("pathname").should("eq", "/sensors");
    });

    // Test 3: Navigate to Proper Readings URL
    it('Clicking Plus Navigates to Readings URL', () => {
        cy.get('.nav-link[href="/readings"]').click();
        cy.location("pathname").should("eq", "/readings");
    });

    // Test 4: Navigate to Proper Projects URL
    it('Clicking Data Navigates to Projects URL', () => {
        cy.get('.nav-link[href="/projects"]').click();
        cy.location("pathname").should("eq", "/projects");
    });

    // Test 5: Navigate to Proper Settings URL
    it('Clicking Gear Navigates to Settings URL', () => {
        cy.get('.nav-link[href="/settings"]').click();
        cy.location("pathname").should("eq", "/settings");
    });

    // Test 6: Navigate to Login via Logout
    it('Clicking Logout Navigates to Login URL', () => {
        cy.get('.logout-link').click();
        cy.location("pathname").should("eq", "/login");
    })

});