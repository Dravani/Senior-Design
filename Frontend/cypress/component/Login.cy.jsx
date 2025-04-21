import React from 'react';
import Login from '../../src/pages/Login';
import { supabase } from '../../src/lib/supabaseClient';
import { mount } from 'cypress/react';

describe('Login Component', () => {
  beforeEach(() => {
    // stub username lookup and auth sign-in
    cy.stub(supabase, 'from').withArgs('users').returns({
      select: cy.stub().returns({ eq: () => ({ single: () => Promise.resolve({ data: { email: 'test@example.com' }, error: null }) }) })
    });
    cy.stub(supabase.auth, 'signInWithPassword').resolves({ data: { session: {}, user: { id: 'uuid-1' } }, error: null });
  });

  it('renders username and password fields', () => {
    mount(<Login />);
    cy.get('input[type="text"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').contains('Log In').should('exist');
  });

  it('performs login flow', () => {
    mount(<Login />);
    cy.get('input[type="text"]').type('testuser');
    cy.get('input[type="password"]').type('password123');
    cy.get('button').contains('Log In').click();

    cy.wrap(supabase.from('users').select)
      .should('have.been.called');
    cy.wrap(supabase.auth.signInWithPassword)
      .should('have.been.calledOnceWith', { email: 'test@example.com', password: 'password123' });
  });
});
