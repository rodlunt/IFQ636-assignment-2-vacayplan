import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from './BottomNav';

const renderWithRouter = (initialRoute = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <BottomNav />
    </MemoryRouter>,
  );

describe('BottomNav', () => {
  test('renders nav with bottom-navigation label', () => {
    renderWithRouter();
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Bottom navigation',
    );
  });

  test('renders exactly 3 tab links: Home, Add, Account', () => {
    renderWithRouter();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links.map((l) => l.textContent.trim())).toEqual([
      'Home',
      'Add',
      'Account',
    ]);
  });

  test('Home link points to /dashboard', () => {
    renderWithRouter();
    expect(screen.getByRole('link', { name: /Home/ })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  test('Add link points to /trips/new', () => {
    renderWithRouter();
    expect(screen.getByRole('link', { name: /Add/ })).toHaveAttribute(
      'href',
      '/trips/new',
    );
  });

  test('Account link points to /profile', () => {
    renderWithRouter();
    expect(screen.getByRole('link', { name: /Account/ })).toHaveAttribute(
      'href',
      '/profile',
    );
  });

  test('active route gets text-brand colour', () => {
    renderWithRouter('/profile');
    expect(screen.getByRole('link', { name: /Account/ })).toHaveClass(
      'text-brand',
    );
    expect(screen.getByRole('link', { name: /Home/ })).not.toHaveClass(
      'text-brand',
    );
  });

  test('hidden on md+ via md:hidden class', () => {
    renderWithRouter();
    expect(screen.getByRole('navigation')).toHaveClass('md:hidden');
  });

  test('fixed to bottom with z-index for stacking', () => {
    renderWithRouter();
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('fixed', 'bottom-0', 'z-40');
  });
});
