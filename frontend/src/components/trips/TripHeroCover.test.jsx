import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TripHeroCover from './TripHeroCover';

const baseTrip = {
  _id: 'trip-1',
  destination: 'Bali, Indonesia',
  title: 'Family getaway',
  startDate: '2026-06-12',
  endDate: '2026-06-19',
  status: 'active',
  coverPhoto: '/assets/trips/bali.webp',
};

const renderHero = (props = {}) =>
  render(
    <MemoryRouter>
      <TripHeroCover trip={{ ...baseTrip, ...props.trip }} onDelete={props.onDelete} />
    </MemoryRouter>
  );

describe('TripHeroCover', () => {
  it('renders destination heading, title, date range, status badge', () => {
    renderHero();
    expect(screen.getByRole('heading', { name: 'Bali, Indonesia' })).toBeInTheDocument();
    expect(screen.getByText('Family getaway')).toBeInTheDocument();
    expect(screen.getByText(/12 Jun/)).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders Upcoming status label when status is upcoming', () => {
    renderHero({ trip: { status: 'upcoming' } });
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('renders Planning status label when status is planning', () => {
    renderHero({ trip: { status: 'planning' } });
    expect(screen.getByText('Planning')).toBeInTheDocument();
  });

  it('Edit link points to /trips/:id/edit and is accessible by name "Edit"', () => {
    renderHero();
    const link = screen.getByRole('link', { name: /Edit/ });
    expect(link).toHaveAttribute('href', '/trips/trip-1/edit');
  });

  it('Delete button invokes onDelete callback', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    renderHero({ onDelete });
    await user.click(screen.getByRole('button', { name: /Delete/ }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('renders explicit coverPhoto when provided', () => {
    renderHero();
    const img = document.querySelector('img');
    expect(img).toHaveAttribute('src', '/assets/trips/bali.webp');
  });

  it('falls back to resolver when coverPhoto is null', () => {
    renderHero({ trip: { coverPhoto: null } });
    const img = document.querySelector('img');
    // resolver returns /trip-covers/bali.webp for "Bali, Indonesia"
    expect(img).toHaveAttribute('src', '/trip-covers/bali.webp');
    expect(img).toHaveAttribute('alt', 'Bali, Indonesia');
  });

  it('uses generic cover image when destination is unknown', () => {
    renderHero({ trip: { coverPhoto: null, destination: 'Unknownland' } });
    const img = document.querySelector('img');
    expect(img).toHaveAttribute('src', '/trip-covers/generic.webp');
  });
});
