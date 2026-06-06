import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomeIcon, MapIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MapIcon as MapIconSolid,
} from '@heroicons/react/24/solid';
import Sidebar from './Sidebar';
import { AuthProvider } from '../../context/AuthContext';

const items = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
  { label: 'My Trips', to: '/trips', icon: MapIcon, iconSolid: MapIconSolid },
];

const renderWithRouter = (ui, initialRoute = '/dashboard') =>
  render(<MemoryRouter initialEntries={[initialRoute]}>{ui}</MemoryRouter>);

describe('Sidebar', () => {
  test('renders aside with primary navigation label', () => {
    renderWithRouter(<Sidebar items={items} />);
    expect(screen.getByRole('complementary')).toHaveAttribute(
      'aria-label',
      'Primary navigation',
    );
  });

  test('renders brand text', () => {
    renderWithRouter(<Sidebar items={items} brand="VacayPlan" />);
    expect(screen.getByText('VacayPlan')).toBeInTheDocument();
  });

  test('renders all item labels as links (flat array shape)', () => {
    renderWithRouter(<Sidebar items={items} />);
    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveAttribute(
      'href',
      '/dashboard',
    );
    expect(screen.getByRole('link', { name: /My Trips/ })).toHaveAttribute(
      'href',
      '/trips',
    );
  });

  test('active route gets the accent background class', () => {
    renderWithRouter(<Sidebar items={items} />, '/dashboard');
    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveClass(
      'bg-brand-accent',
    );
    expect(screen.getByRole('link', { name: /My Trips/ })).not.toHaveClass(
      'bg-brand-accent',
    );
  });

  test('renders empty nav when items is empty', () => {
    renderWithRouter(<Sidebar items={[]} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  test('uses md:bg-brand-dark for the desktop background', () => {
    renderWithRouter(<Sidebar items={items} />);
    expect(screen.getByRole('complementary')).toHaveClass('md:bg-brand-dark');
  });

  test('renders section headers when given sectioned items', () => {
    const sectioned = [
      { section: 'MAIN', items: [items[0]] },
      {
        section: 'ACCOUNT',
        items: [
          {
            label: 'Settings',
            to: '/settings',
            icon: BookmarkIcon,
            disabled: true,
          },
        ],
      },
    ];
    renderWithRouter(<Sidebar items={sectioned} />);
    expect(screen.getByText('MAIN')).toBeInTheDocument();
    expect(screen.getByText('ACCOUNT')).toBeInTheDocument();
  });

  test('disabled items render without a link and are aria-disabled', () => {
    const sectioned = [
      {
        section: 'ACCOUNT',
        items: [
          {
            label: 'Settings',
            to: '/settings',
            icon: BookmarkIcon,
            disabled: true,
          },
        ],
      },
    ];
    renderWithRouter(<Sidebar items={sectioned} />);
    expect(screen.queryByRole('link', { name: /Settings/ })).toBeNull();
    const settingsLabel = screen.getByText('Settings');
    const wrapper = settingsLabel.closest('[aria-disabled="true"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute('title', 'Coming soon');
  });

  test('renders user footer with initial and short name when user present', () => {
    const renderWithAuth = (initialRoute = '/dashboard') => {
      // Seed localStorage so AuthProvider picks up the user
      localStorage.setItem(
        'vacationplan_user',
        JSON.stringify({ name: 'Rodney Lunt', email: 'r@example.com' }),
      );
      return render(
        <AuthProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <Sidebar items={items} />
          </MemoryRouter>
        </AuthProvider>,
      );
    };
    renderWithAuth();
    expect(screen.getByText('Rodney L.')).toBeInTheDocument();
    expect(screen.getByText('Free plan')).toBeInTheDocument();
    // initial avatar text
    expect(screen.getByText('R')).toBeInTheDocument();
    localStorage.removeItem('vacationplan_user');
  });

  test('still renders Logout button (VP-123 carry-forward)', () => {
    renderWithRouter(<Sidebar items={items} />);
    expect(screen.getByRole('button', { name: /Logout/ })).toBeInTheDocument();
  });
});
