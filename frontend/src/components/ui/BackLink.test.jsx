import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BackLink from './BackLink';

const renderWithRouter = (ui) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('BackLink', () => {
  test('renders react-router Link when "to" prop is set', () => {
    renderWithRouter(<BackLink to="/dashboard">Dashboard</BackLink>);
    const link = screen.getByRole('link', { name: /Dashboard/ });
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  test('renders anchor when "href" prop is set', () => {
    render(<BackLink href="/x">Trips</BackLink>);
    expect(screen.getByRole('link', { name: /Trips/ })).toHaveAttribute(
      'href',
      '/x',
    );
  });

  test('default text is "Back"', () => {
    renderWithRouter(<BackLink to="/x" />);
    expect(screen.getByRole('link', { name: /Back/ })).toBeInTheDocument();
  });

  test('chevron icon is rendered (svg present)', () => {
    renderWithRouter(<BackLink to="/x">Trips</BackLink>);
    const link = screen.getByRole('link', { name: /Trips/ });
    expect(link.querySelector('svg')).toBeInTheDocument();
  });

  test('caller className is appended', () => {
    renderWithRouter(
      <BackLink to="/x" className="custom">
        Trips
      </BackLink>,
    );
    expect(screen.getByRole('link', { name: /Trips/ })).toHaveClass('custom');
  });
});
