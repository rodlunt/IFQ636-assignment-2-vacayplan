import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TextLink from './TextLink';

const renderWithRouter = (ui) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('TextLink', () => {
  test('renders react-router Link when "to" prop is set', () => {
    renderWithRouter(<TextLink to="/forgot">Forgot password?</TextLink>);
    const link = screen.getByRole('link', { name: 'Forgot password?' });
    expect(link).toHaveAttribute('href', '/forgot');
  });

  test('renders anchor when "href" prop is set', () => {
    render(
      <TextLink href="https://example.com">external</TextLink>,
    );
    const link = screen.getByRole('link', { name: 'external' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  test('renders span when neither to nor href is set', () => {
    render(<TextLink>plain</TextLink>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('plain').tagName).toBe('SPAN');
  });

  test('applies brand text colour', () => {
    renderWithRouter(<TextLink to="/x">click</TextLink>);
    expect(screen.getByRole('link')).toHaveClass('text-brand');
  });

  test('caller className is appended', () => {
    renderWithRouter(
      <TextLink to="/x" className="custom">
        click
      </TextLink>,
    );
    expect(screen.getByRole('link')).toHaveClass('custom');
  });
});
