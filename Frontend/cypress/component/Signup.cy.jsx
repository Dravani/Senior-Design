import React from 'react';
import SignUp from '../../src/pages/SignUp';
import { supabase } from '../../src/lib/supabaseClient';
import { mount } from 'cypress/react';

describe('SignUp Component', () => {
  beforeEach(() => {
    // stub the Supabase auth and table insert calls
    cy.stub(supabase.auth, 'signUpWithPassword').resolves({ data: { user: { id: 'uuid-1' } }, error: null });
    cy.stub(supabase, 'from').withArgs('users').returns({
      insert: cy.stub().resolves({ data: [{ id: 'uuid-1', email: 'test@example.com', username: 'testuser', role: 'user' }], error: null })
    });
  });

  it('renders all form fields', () => {
    mount(<SignUp />);
    cy.get('input[type="email"]').should('exist');
    cy.get('input[placeholder="Enter your username"]').should('exist');
    cy.get('input[placeholder="Choose a password"]').should('exist');
    cy.get('input[placeholder="Re‑enter your password"]').should('exist');
    cy.get('button').contains('Register').should('exist');
  });

  it('submits valid data and calls Supabase', () => {
    mount(<SignUp />);
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[placeholder="Enter your username"]').type('testuser');
    cy.get('input[placeholder="Choose a password"]').type('password123');
    cy.get('input[placeholder="Re‑enter your password"]').type('password123');
    cy.get('button').contains('Register').click();

    cy.wrap(supabase.auth.signUpWithPassword)
      .should('have.been.calledOnceWith', { email: 'test@example.com', password: 'password123' });
    cy.wrap(supabase.from('users').insert)
      .should('have.been.calledOnce');
  });
});