import { I18nextProvider } from 'react-i18next';
import { priceData } from 'stories/mockData';
import i18n from 'translation/i18n';
import { FuturePriceData } from 'types';

import { FuturePrice } from './FuturePrice';

describe('FuturePrice only positive values', () => {
  beforeEach(() => {
    const now = new Date('2024-09-02T02:00:00Z').getTime();
    cy.clock(now);
    cy.mount(
      <I18nextProvider i18n={i18n}>
        <FuturePrice futurePrice={priceData as FuturePriceData}></FuturePrice>
      </I18nextProvider>
    );
  });

  it('Opens when accordion clicked', () => {
    cy.get('[data-test-id="future-price"]').should('not.exist');
    cy.get('[data-test-id="collapse-button"]').click();
    cy.get('[data-test-id="future-price"]').should('be.visible');
  });

  it('Tomorrow label is visible', () => {
    cy.get('[data-test-id="tomorrow-label"]').should('be.visible');
  });

  it('Price data is visible', () => {
    cy.get('[data-test-id="negative-price"]').should('not.exist');
    cy.get('[data-test-id="price-bar"]').should('be.visible');
    cy.get('[data-test-id="positive-price"]').should('be.visible');
  });

  it('Disclaimers are visible', () => {
    cy.get('[data-test-id="time-disclaimer"]').should('be.visible');
    cy.get('[data-test-id="price-disclaimer"]').should('be.visible');
  });

  it('now label is visible', () => {
    cy.get('[data-test-id="now-label"]').should('be.visible');
  });
});

const negativePriceData = JSON.parse(JSON.stringify(priceData));

negativePriceData.priceData['2024-09-02 03:00:00+00:00'] = -0.2;
negativePriceData.priceData['2024-09-02 13:00:00+00:00'] = -0.9;
negativePriceData.priceData['2024-09-02 08:00:00+00:00'] = -0.3;

describe('FuturePrice negative values', () => {
  beforeEach(() => {
    const now = new Date('2024-09-02T02:00:00Z').getTime();
    cy.clock(now);
    cy.mount(
      <I18nextProvider i18n={i18n}>
        <FuturePrice futurePrice={negativePriceData as FuturePriceData}></FuturePrice>
      </I18nextProvider>
    );
  });

  it('Price data is visible', () => {
    cy.get('[data-test-id="negative-price"]').should('be.visible');
    cy.get('[data-test-id="price-bar"]').should('be.visible');
    cy.get('[data-test-id="positive-price"]').should('be.visible');
  });
});