// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../LanguageProvider';

function Consumer() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <div data-testid="lang">{language}</div>
      <div data-testid="label">{t('aria.language')}</div>
      <button onClick={() => setLanguage('it')}>to-it</button>
    </div>
  );
}

it('LanguageProvider updates document.lang and translations', async () => {
  localStorage.setItem('zazarap_language', 'de');
  render(
    <LanguageProvider>
      <Consumer />
    </LanguageProvider>
  );

  expect(document.documentElement.lang).toBe('de');
  expect(screen.getByTestId('label').textContent).toBeTruthy();

  fireEvent.click(screen.getByText('to-it'));
  await waitFor(() => expect(document.documentElement.lang).toBe('it'));
  expect(screen.getByTestId('label').textContent?.toLowerCase()).toContain('lingua');
});