import { render, screen } from '@testing-library/react';
import StatsCard from './StatsCard';
import { deriveDashboardStats } from './dashboardStats';

describe('StatsCard', () => {
  it('renders label and value', () => {
    render(<StatsCard label="Total Trips" value={3} />);
    expect(screen.getByText('Total Trips')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders subtext when provided', () => {
    render(<StatsCard label="Total Trips" value={3} subtext="2 active · 1 upcoming" />);
    expect(screen.getByText('2 active · 1 upcoming')).toBeInTheDocument();
  });

  it('omits subtext element when not provided', () => {
    const { container } = render(<StatsCard label="Total Trips" value={3} />);
    // Only label and value spans should render; no third span sibling
    expect(container.querySelectorAll('span').length).toBe(2);
  });
});

describe('deriveDashboardStats', () => {
  const now = new Date('2026-05-26T12:00:00');

  it('returns zero/empty when trips list is empty', () => {
    const stats = deriveDashboardStats([], now);
    expect(stats.totalTrips).toBe(0);
    expect(stats.daysUntil).toBeNull();
    expect(stats.daysUntilDisplay).toBe('—');
    expect(stats.totalBudgetDisplay).toBe('—');
    expect(stats.countries).toBe(0);
  });

  it('counts trips, computes days-until next upcoming, sums budget, counts unique countries', () => {
    const trips = [
      { destination: 'Bali, Indonesia', startDate: '2026-06-12', budget: 2400 },
      { destination: 'Tokyo, Japan', startDate: '2026-09-03', budget: 3100 },
      { destination: 'Paris, France', startDate: '2025-09-05', budget: 4200 },
    ];
    const stats = deriveDashboardStats(trips, now);
    expect(stats.totalTrips).toBe(3);
    // Bali is the next upcoming trip from 2026-05-26 -> 2026-06-12 is 17 days
    expect(stats.daysUntil).toBe(17);
    expect(stats.totalBudget).toBe(9700);
    expect(stats.totalBudgetDisplay).toMatch(/\$9,700/);
    expect(stats.countries).toBe(3);
  });

  it('treats past-dated trips correctly when computing days-until', () => {
    const trips = [
      { destination: 'Paris, France', startDate: '2025-09-05', budget: 4200 },
    ];
    const stats = deriveDashboardStats(trips, now);
    expect(stats.daysUntil).toBeNull();
  });

  it('deduplicates countries by trailing comma part', () => {
    const trips = [
      { destination: 'Bali, Indonesia', startDate: '2026-06-12', budget: 0 },
      { destination: 'Jakarta, Indonesia', startDate: '2026-07-01', budget: 0 },
    ];
    const stats = deriveDashboardStats(trips, now);
    expect(stats.countries).toBe(1);
  });
});
