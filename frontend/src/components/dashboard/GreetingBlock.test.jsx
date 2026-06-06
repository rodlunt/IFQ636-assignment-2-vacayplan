import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GreetingBlock from './GreetingBlock';

const renderBlock = (props = {}) =>
  render(
    <MemoryRouter>
      <GreetingBlock {...props} />
    </MemoryRouter>
  );

describe('GreetingBlock', () => {
  it('renders "Good morning" before noon', () => {
    renderBlock({ now: new Date('2026-05-26T08:00:00') });
    expect(screen.getByRole('heading', { name: /Good morning/ })).toBeInTheDocument();
  });

  it('renders "Good afternoon" between noon and 6pm', () => {
    renderBlock({ now: new Date('2026-05-26T14:30:00') });
    expect(screen.getByRole('heading', { name: /Good afternoon/ })).toBeInTheDocument();
  });

  it('renders "Good evening" after 6pm', () => {
    renderBlock({ now: new Date('2026-05-26T20:00:00') });
    expect(screen.getByRole('heading', { name: /Good evening/ })).toBeInTheDocument();
  });

  it('appends the user name when provided', () => {
    renderBlock({ userName: 'Rodney', now: new Date('2026-05-26T10:00:00') });
    expect(screen.getByRole('heading', { name: /Good morning, Rodney/ })).toBeInTheDocument();
  });

  it('renders the + Add Trip link pointing to /trips/new', () => {
    renderBlock();
    const link = screen.getByRole('link', { name: '+ Add Trip' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/trips/new');
  });
});
