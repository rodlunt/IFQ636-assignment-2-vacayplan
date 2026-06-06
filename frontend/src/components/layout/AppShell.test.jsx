import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid } from '@heroicons/react/24/solid';
import AppShell from './AppShell';

const items = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
];

const renderWithRouter = (ui, initialRoute = '/dashboard') =>
  render(<MemoryRouter initialEntries={[initialRoute]}>{ui}</MemoryRouter>);

describe('AppShell', () => {
  test('renders children inside main', () => {
    renderWithRouter(
      <AppShell items={items}>
        <h1>Page content here</h1>
      </AppShell>,
    );
    expect(screen.getByText('Page content here')).toBeInTheDocument();
    expect(screen.getByRole('main')).toContainElement(
      screen.getByText('Page content here'),
    );
  });

  test('renders Sidebar (complementary) and BottomNav (navigation) together', () => {
    renderWithRouter(
      <AppShell items={items}>
        <div>x</div>
      </AppShell>,
    );
    expect(
      screen.getByRole('complementary', { name: 'Primary navigation' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Bottom navigation' }),
    ).toBeInTheDocument();
  });

  test('main has pb-16 md:pb-0 so BottomNav does not overlap mobile content', () => {
    renderWithRouter(
      <AppShell items={items}>
        <div>x</div>
      </AppShell>,
    );
    const main = screen.getByRole('main');
    expect(main).toHaveClass('pb-16', 'md:pb-0');
  });

  test('forwards items to Sidebar', () => {
    renderWithRouter(
      <AppShell items={items}>
        <div>x</div>
      </AppShell>,
    );
    expect(
      screen.getByRole('link', { name: /Dashboard/ }),
    ).toBeInTheDocument();
  });

  test('forwards brand to Sidebar (default "VacayPlan")', () => {
    renderWithRouter(
      <AppShell items={items}>
        <div>x</div>
      </AppShell>,
    );
    expect(screen.getByText('VacayPlan')).toBeInTheDocument();
  });
});
