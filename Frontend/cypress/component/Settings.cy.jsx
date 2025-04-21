import React from 'react';
import Settings from '../../src/pages/Settings';
import { supabase } from '../../src/supabaseClient';
import { mount } from 'cypress/react';

describe('Settings Component', () => {
  beforeEach(() => {
    cy.window().then(win => {
      win.sessionStorage.setItem('currentUser', JSON.stringify({ id: 'uuid-1', username: 'testuser', email: 'test@example.com' }));
    });
    cy.stub(supabase, 'from').withArgs('users').returns({
      select: cy.stub().returns({ eq: () => ({ single: () => Promise.resolve({ data: { email: 'test@example.com', username: 'testuser' }, error: null }) }) }),
      update: cy.stub().returns({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { email: 'new@example.com', username: 'newuser' }, error: null }) }) }) })
    });
  });

  it('renders current email and username', () => {
    mount(<Settings />);
    cy.get('.value').first().should('contain', 'test@example.com');
    cy.get('.value').eq(1).should('contain', 'testuser');
  });

  it('edits the email field', () => {
    mount(<Settings />);
    cy.contains('Edit').first().click();
    cy.get('input[type="email"]').clear().type('new@example.com');
    cy.contains('Save').click();

    cy.wrap(supabase.from('users').update)
      .should('have.been.called');
    cy.get('.value').first().should('contain', 'new@example.com');
  });
});
