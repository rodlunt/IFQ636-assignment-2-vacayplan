import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthTabSwitcher from './AuthTabSwitcher';

const renderWithRouter = (ui) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('AuthTabSwitcher', () => {
  test('renders Sign In and Register tabs', () => {
    renderWithRouter(<AuthTabSwitcher activeTab="signin" />);
    expect(screen.getByRole('tab', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Register' })).toBeInTheDocument();
  });

  test('marks the Sign In tab as active when activeTab="signin"', () => {
    renderWithRouter(<AuthTabSwitcher activeTab="signin" />);
    expect(screen.getByRole('tab', { name: 'Sign In' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Register' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  test('marks the Register tab as active when activeTab="register"', () => {
    renderWithRouter(<AuthTabSwitcher activeTab="register" />);
    expect(screen.getByRole('tab', { name: 'Register' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Sign In' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  test('tabs link to /login and /register', () => {
    renderWithRouter(<AuthTabSwitcher activeTab="signin" />);
    expect(screen.getByRole('tab', { name: 'Sign In' })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByRole('tab', { name: 'Register' })).toHaveAttribute(
      'href',
      '/register',
    );
  });
});
