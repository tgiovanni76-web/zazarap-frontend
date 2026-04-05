// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: async () => null,
      isAuthenticated: async () => false,
      redirectToLogin: () => {}
    },
    entities: {
      SEOSettings: { list: async () => [] },
      Notification: { filter: async () => [] }
    }
  }
}));

// Stub lazy imports in layout
vi.mock('@/components/Analytics', () => ({ default: () => null }));
vi.mock('@/components/marketplace/StructuredData', () => ({ default: () => null }));
vi.mock('@/components/SEOHead', () => ({ default: () => null }));
vi.mock('@/components/LanguageSwitcher', () => ({ default: () => null }));
vi.mock('@/components/NewsletterForm', () => ({ default: () => null }));
vi.mock('@/components/CookieBanner', () => ({ default: () => null }));

import Layout from '../../layout';

it('Layout renders without crashing and exposes main content anchor', () => {
  const qc = new QueryClient();
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Layout currentPageName="Home">
          <div data-testid="content">Hello</div>
        </Layout>
      </MemoryRouter>
    </QueryClientProvider>
  );
  expect(screen.getByTestId('content')).toBeInTheDocument();
  expect(document.getElementById('main-content')).toBeInTheDocument();
});