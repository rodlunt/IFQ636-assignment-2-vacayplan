import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UpcomingDeparturesCard from './UpcomingDeparturesCard';

const renderCard = (props = {}) =>
  render(
    <MemoryRouter>
      <UpcomingDeparturesCard {...props} />
    </MemoryRouter>
  );

describe('UpcomingDeparturesCard', () => {
  const now = new Date('2026-05-26T12:00:00');

  it('renders empty-state copy when no upcoming trips', () => {
    renderCard({ trips: [], now });
    expect(screen.getByText(/No upcoming trips scheduled/i)).toBeInTheDocument();
  });

  it('lists upcoming trips sorted by closest start date with day counts', () => {
    const trips = [
      { _id: 't-1', destination: 'Tokyo, Japan', startDate: '2026-09-03' },
      { _id: 't-2', destination: 'Bali, Indonesia', startDate: '2026-06-12' },
      { _id: 't-3', destination: 'Paris, France', startDate: '2025-09-05' },
    ];
    renderCard({ trips, now });

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent('Bali, Indonesia');
    expect(links[1]).toHaveTextContent('Tokyo, Japan');
    expect(screen.getByText(/17 days/)).toBeInTheDocument();
  });

  it('caps to limit prop', () => {
    const trips = Array.from({ length: 5 }).map((_, i) => ({
      _id: `t-${i}`,
      destination: `Trip ${i}`,
      startDate: new Date(`2026-${String(6 + i).padStart(2, '0')}-15`).toISOString(),
    }));
    renderCard({ trips, now, limit: 2 });
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
