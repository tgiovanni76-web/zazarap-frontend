// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: { me: async () => ({ email: 'user@test.com', role: 'admin' }) },
    entities: { SEOSettings: { list: async () => [] }, Notification: { filter: async () => [] } }
  }
}));
vi.mock('@/components/Analytics', () => ({ default: () => null }));
vi.mock('@/components/marketplace/StructuredData', () => ({ default: () => null }));
vi.mock('@/components/SEOHead', () => ({ default: () => null }));
vi.mock('@/components/LanguageSwitcher', () => ({ default: () => <span aria-label="Sprache wählen" /> }));
vi.mock('@/components/NewsletterForm', () => ({ default: () => null }));
vi.mock('@/components/CookieBanner', () => ({ default: () => null }));

import Layout from '../../layout';

it('Header nav exposes German aria-labels', async () => {
  localStorage.setItem('zazarap_language', 'de');
  const qc = new QueryClient();
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Layout currentPageName="Home">
          <div />
        </Layout>
      </MemoryRouter>
    </QueryClientProvider>
  );
  // Home
  expect(await screen.findByLabelText('Startseite')).toBeInTheDocument();
  // Create ad
  expect(screen.getByLabelText('Anzeige erstellen')).toBeInTheDocument();
  // Notifications
  expect(screen.getByLabelText('Benachrichtigungen')).toBeInTheDocument();
  // Settings (admin visible)
  expect(screen.getByLabelText('Einstellungen')).toBeInTheDocument();
  // Language
  expect(screen.getByLabelText('Sprache wählen')).toBeInTheDocument();
});