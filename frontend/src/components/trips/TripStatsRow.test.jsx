import { render, screen } from '@testing-library/react';
import TripStatsRow, { deriveTripStats } from './TripStatsRow';

describe('deriveTripStats', () => {
  const now = new Date('2026-05-26T12:00:00');

  it('computes days-until + nights for an upcoming trip', () => {
    const stats = deriveTripStats(
      { startDate: '2026-06-12', endDate: '2026-06-19', budget: 2400 },
      now
    );
    expect(stats.daysUntil).toBe('17');
    expect(stats.nights).toBe(7);
    expect(stats.budgetDisplay).toMatch(/\$2,400/);
  });

  it('clamps days-until to 0 for past trips', () => {
    const stats = deriveTripStats(
      { startDate: '2025-09-05', endDate: '2025-09-15', budget: 4200 },
      now
    );
    expect(stats.daysUntil).toBe('0');
  });

  it('returns dashes when trip is null/empty', () => {
    const stats = deriveTripStats(null, now);
    expect(stats.daysUntil).toBe('—');
    expect(stats.nights).toBe('—');
  });
});

describe('TripStatsRow', () => {
  it('renders 4 labelled stat tiles', () => {
    render(
      <TripStatsRow
        trip={{ startDate: '2026-06-12', endDate: '2026-06-19', budget: 2400 }}
        now={new Date('2026-05-26T12:00:00')}
      />
    );
    expect(screen.getByText('Days Until')).toBeInTheDocument();
    expect(screen.getByText('Nights')).toBeInTheDocument();
    expect(screen.getByText('Spent %')).toBeInTheDocument();
    expect(screen.getByText('Budget')).toBeInTheDocument();
  });
});
