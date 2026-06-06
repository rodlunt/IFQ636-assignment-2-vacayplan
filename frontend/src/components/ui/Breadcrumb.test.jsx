import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

const renderWithRouter = (ui) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Breadcrumb', () => {
  test('renders nothing when items is empty', () => {
    const { container } = renderWithRouter(<Breadcrumb items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders all labels in order', () => {
    renderWithRouter(
      <Breadcrumb
        items={[
          { label: 'Dashboard', to: '/' },
          { label: 'Trips', to: '/trips' },
          { label: 'Bali' },
        ]}
      />,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Trips')).toBeInTheDocument();
    expect(screen.getByText('Bali')).toBeInTheDocument();
  });

  test('non-last items render as links when "to" is set', () => {
    renderWithRouter(
      <Breadcrumb
        items={[
          { label: 'Dashboard', to: '/' },
          { label: 'Trips', to: '/trips' },
          { label: 'Bali' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'Trips' })).toHaveAttribute(
      'href',
      '/trips',
    );
  });

  test('last item is not a link and has aria-current="page"', () => {
    renderWithRouter(
      <Breadcrumb
        items={[{ label: 'Dashboard', to: '/' }, { label: 'Bali' }]}
      />,
    );
    expect(screen.queryByRole('link', { name: 'Bali' })).not.toBeInTheDocument();
    expect(screen.getByText('Bali')).toHaveAttribute('aria-current', 'page');
  });

  test('separator chevrons appear between items, not after the last', () => {
    const { container } = renderWithRouter(
      <Breadcrumb
        items={[
          { label: 'A', to: '/a' },
          { label: 'B', to: '/b' },
          { label: 'C' },
        ]}
      />,
    );
    expect(container.querySelectorAll('svg')).toHaveLength(2);
  });

  test('nav has aria-label "Breadcrumb"', () => {
    renderWithRouter(
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'X' }]} />,
    );
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Breadcrumb',
    );
  });
});
