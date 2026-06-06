import { render, screen } from '@testing-library/react';
import Spinner from './Spinner';

describe('Spinner', () => {
  test('renders with role=status', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('default aria-label is Loading', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  test('custom label overrides the default', () => {
    render(<Spinner label="Saving trip" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Saving trip',
    );
  });

  test.each([
    ['sm', 'h-4'],
    ['md', 'h-6'],
    ['lg', 'h-8'],
  ])('size "%s" applies its height class', (size, expected) => {
    render(<Spinner size={size} />);
    expect(screen.getByRole('status')).toHaveClass(expected);
  });

  test('has animate-spin for the rotation', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveClass('animate-spin');
  });

  test('caller className is appended', () => {
    render(<Spinner className="custom" />);
    expect(screen.getByRole('status')).toHaveClass('custom');
  });
});
