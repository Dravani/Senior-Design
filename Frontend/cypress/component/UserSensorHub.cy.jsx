import { mount } from 'cypress/react'
import { MemoryRouter } from 'react-router-dom'

import UserSensorHub from '../../src/pages/UserSensorHub'
import '../../src/pages/UserSensorHub.css'

const mountHub = () =>
  mount(
    <MemoryRouter>
      <UserSensorHub />
    </MemoryRouter>
  )

describe('UserSensorHub Page Tests', () => {

  it('Active Sensors title and welcome message appear', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: [],
    }).as('getSensors')

    mountHub()
    cy.wait('@getSensors')

    cy.contains('Welcome, User!').should('exist')
    cy.get('.underline').should('contain.text', 'Active Sensors')
  })

  it('Table headers load properly', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: [],
    }).as('getSensors')

    mountHub()
    cy.wait('@getSensors')

    const headers = ['Name', 'Status', 'Last Reading']
    cy.get('th').each(($th, idx) => {
      cy.wrap($th).should('contain.text', headers[idx])
    })
  })

  it('Displays sensor rows when sensors are available', () => {
    const sensors = [
      { sensor_name: 'Sensor1', is_disabled: false, duration: '5m ago' },
      { sensor_name: 'Sensor2', is_disabled: true, duration: '10m ago' },
    ]
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: sensors,
    }).as('getSensors')

    mountHub()
    cy.wait('@getSensors')

    cy.get('tbody tr').should('have.length', sensors.length)

    cy.get('tbody tr').first().within(() => {
      cy.get('a.sensor-link')
        .should('contain.text', 'Sensor1')
        .and('have.attr', 'href', '/readings/Sensor1')
      cy.get('td').eq(1).should('contain.text', 'Enabled')
      cy.get('td').eq(2).should('contain.text', '5m ago')
    })
  })

  it('Displays "No sensors available" when none are returned', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: [],
    }).as('getSensors')

    mountHub()
    cy.wait('@getSensors')

    cy.get('tbody tr').should('have.length', 1)
    cy.contains('No sensors available').should('exist')
  })

  it('Clicking a sensor link stores it in localStorage', () => {
    const sensors = [{ sensor_name: 'S1', is_disabled: false, duration: 'now' }]
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: sensors,
    }).as('getSensors')

    localStorage.clear()
    mountHub()
    cy.wait('@getSensors')

    cy.get('a.sensor-link').click()
    cy.window().then(win => {
      const stored = JSON.parse(win.localStorage.getItem('selectedSensors'))
      expect(stored).to.include('S1')
    })
  })

  it('Shows "No sensors available" when API fails', () => {
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', { statusCode: 500 }).as(
      'getSensorsFail'
    )

    mountHub()
    cy.wait('@getSensorsFail')

    cy.contains('No sensors available').should('exist')
  })

  it('Renders rows even when sensor_name is null', () => {
    const sensors = [
      { sensor_name: 'A', is_disabled: false, duration: '1m' },
      { sensor_name: null, is_disabled: false, duration: '2m' },
      { sensor_name: 'B', is_disabled: false, duration: '3m' },
    ]
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: sensors,
    }).as('getSensors')

    mountHub()
    cy.wait('@getSensors')

    cy.get('tbody tr').should('have.length', sensors.length)
  })

  it('Renders duplicate sensor entries exactly as returned', () => {
    const sensors = [
      { sensor_name: 'X', is_disabled: false, duration: '1m' },
      { sensor_name: 'X', is_disabled: false, duration: '2m' },
      { sensor_name: 'Y', is_disabled: false, duration: '3m' },
      { sensor_name: 'Y', is_disabled: false, duration: '4m' },
    ]
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: sensors,
    }).as('getSensors')

    mountHub()
    cy.wait('@getSensors')

    cy.get('tbody tr').should('have.length', sensors.length)
  })

  it('Sensor links encode special characters in href', () => {
    const sensors = [
      {
        sensor_name: 'Name with spaces',
        is_disabled: false,
        duration: 'now',
      },
    ]
    cy.intercept('GET', 'http://localhost:3000/api/sensors/', {
      statusCode: 200,
      body: sensors,
    }).as('getSensors')

    mountHub()
    cy.wait('@getSensors')

    cy.get('a.sensor-link').should(
      'have.attr',
      'href',
      '/readings/Name%20with%20spaces'
    )
  })
})
