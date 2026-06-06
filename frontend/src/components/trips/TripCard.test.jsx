import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TripCard from './TripCard';

const baseTrip = {
  _id: 'trip-1',
  destination: 'Bali, Indonesia',
  startDate: '2026-06-12',
  endDate: '2026-06-19',
  budget: 2400,
  status: 'active',
  coverPhoto: '/assets/trips/bali.webp',
};

const renderCard = (props = {}) =>
  render(
    <MemoryRouter>
      <ul>
        <TripCard trip={{ ...baseTrip, ...props.trip }} onEdit={props.onEdit} onDelete={props.onDelete} />
      </ul>
    </MemoryRouter>
  );

describe('TripCard', () => {
  it('renders destination, dates, budget, and links to /trips/:id', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'Bali, Indonesia' })).toBeInTheDocument();
    expect(screen.getByText(/12 Jun/)).toBeInTheDocument();
    expect(screen.getByText(/Budget:/)).toBeInTheDocument();
    expect(screen.getByText(/\$2,400/)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/trips/trip-1');
  });

  it('renders status badge with correct label for active', () => {
    renderCard();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('falls back to Planning label when status is missing', () => {
    renderCard({ trip: { status: undefined } });
    expect(screen.getByText('Planning')).toBeInTheDocument();
  });

  it('renders Completed for status=completed', () => {
    renderCard({ trip: { status: 'completed' } });
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders an img with the coverPhoto src when provided', () => {
    renderCard();
    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('src', '/assets/trips/bali.webp');
  });

  it('falls back to the destination-resolved cover image when coverPhoto is null', () => {
    renderCard({ trip: { coverPhoto: null } });
    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    // destination "Bali, Indonesia" resolves to /trip-covers/bali.webp
    expect(img).toHaveAttribute('src', '/trip-covers/bali.webp');
    expect(img).toHaveAttribute('alt', 'Bali, Indonesia');
  });

  it('falls back to the generic cover image when destination is not in the known list', () => {
    renderCard({ trip: { coverPhoto: null, destination: 'Atlantis' } });
    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('src', '/trip-covers/generic.webp');
  });

  it('invokes onEdit / onDelete callbacks when their buttons are clicked', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    renderCard({ onEdit, onDelete });

    await user.click(screen.getByRole('button', { name: 'Edit Bali, Indonesia' }));
    expect(onEdit).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Delete Bali, Indonesia' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('hides Edit/Delete actions when callbacks are not provided', () => {
    renderCard();
    expect(screen.queryByRole('button', { name: /Edit/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Delete/ })).toBeNull();
  });
});
