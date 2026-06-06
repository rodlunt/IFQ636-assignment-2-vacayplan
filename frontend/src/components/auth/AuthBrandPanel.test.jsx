import { render, screen } from '@testing-library/react';
import AuthBrandPanel from './AuthBrandPanel';

describe('AuthBrandPanel', () => {
  test('renders the VacayPlan wordmark', () => {
    render(<AuthBrandPanel />);
    expect(screen.getByText('VacayPlan')).toBeInTheDocument();
  });

  test('renders the default headline with amber-highlighted word', () => {
    render(<AuthBrandPanel />);
    expect(screen.getByText('adventure')).toHaveClass('text-brand-accent');
    expect(screen.getByText(/Plan your next/)).toBeInTheDocument();
  });

  test('renders the default sub-copy', () => {
    render(<AuthBrandPanel />);
    expect(
      screen.getByText(/Manage all your trips, bookings, and itineraries/),
    ).toBeInTheDocument();
  });

  test('renders the default three-column stats row', () => {
    render(<AuthBrandPanel />);
    expect(screen.getByText('12k+')).toBeInTheDocument();
    expect(screen.getByText('Active travellers')).toBeInTheDocument();
    expect(screen.getByText('48k')).toBeInTheDocument();
    expect(screen.getByText('Trips planned')).toBeInTheDocument();
    expect(screen.getByText('94%')).toBeInTheDocument();
    expect(screen.getByText('Satisfaction rate')).toBeInTheDocument();
  });

  test('accepts custom stats via prop', () => {
    render(
      <AuthBrandPanel
        stats={[
          { value: '99', label: 'Custom one' },
          { value: '88', label: 'Custom two' },
          { value: '77', label: 'Custom three' },
        ]}
      />,
    );
    expect(screen.getByText('Custom one')).toBeInTheDocument();
    expect(screen.queryByText('Active travellers')).not.toBeInTheDocument();
  });
});
