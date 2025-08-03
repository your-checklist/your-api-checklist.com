import { render, screen } from '@testing-library/react';
import App from './App';

// Mock i18next to avoid warnings in tests
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key, // Return the key as the translation
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    }
  }),
}));

test('renders API checklist title', () => {
  render(<App />);
  const titleElement = screen.getByText('title');
  expect(titleElement).toBeInTheDocument();
});

test('renders security category with sanitization item', () => {
  render(<App />);
  const securityElements = screen.getAllByText('Security');
  expect(securityElements.length).toBeGreaterThan(0);
  
  // Check for the new sanitization text in the checklist
  const sanitizationText = screen.getByText('Sanitize all input data and never trust the client');
  expect(sanitizationText).toBeInTheDocument();
});
