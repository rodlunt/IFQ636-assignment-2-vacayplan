import { render, screen, fireEvent } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar', () => {
  test('renders initials when no src', () => {
    render(<Avatar name="Jane Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  test('single-name renders single initial', () => {
    render(<Avatar name="Cher" />);
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  test('empty name renders ?', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  test('renders <img> when src provided', () => {
    render(<Avatar name="Jane Doe" src="/jane.jpg" />);
    const img = screen.getByRole('img', { name: 'Jane Doe' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/jane.jpg');
  });

  test('falls back to initials when img errors', () => {
    render(<Avatar name="Jane Doe" src="/missing.jpg" />);
    fireEvent.error(screen.getByRole('img', { name: 'Jane Doe' }));
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  test.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
  ])('size "%s" applies its height class', (size, expected) => {
    const { container } = render(<Avatar name="J" size={size} />);
    expect(container.firstChild).toHaveClass(expected);
  });

  test('initials uppercased even when name is lowercase', () => {
    render(<Avatar name="jane doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
