import { render, screen } from '@testing-library/react';
import App from './App';

test('renders storefront header', () => {
  render(<App />);
  const headerElement = screen.getByText(/React Storefront/i);
  expect(headerElement).toBeInTheDocument();
});
