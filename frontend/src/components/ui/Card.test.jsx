import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  test('renders children', () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('default padding is md (p-6)', () => {
    render(<Card data-testid="c">x</Card>);
    expect(screen.getByTestId('c')).toHaveClass('p-6');
  });

  test.each([
    ['none', ''],
    ['sm', 'p-4'],
    ['md', 'p-6'],
    ['lg', 'p-8'],
  ])('padding "%s" applies expected class', (padding, expected) => {
    render(
      <Card padding={padding} data-testid="c">
        x
      </Card>,
    );
    if (expected) {
      expect(screen.getByTestId('c')).toHaveClass(expected);
    } else {
      expect(screen.getByTestId('c').className).not.toMatch(/\bp-\d/);
    }
  });

  test('applies bg + border + rounded-xl base classes', () => {
    render(<Card data-testid="c">x</Card>);
    const el = screen.getByTestId('c');
    expect(el).toHaveClass('bg-surface', 'border', 'rounded-xl');
  });

  test('caller className is appended', () => {
    render(
      <Card className="custom" data-testid="c">
        x
      </Card>,
    );
    expect(screen.getByTestId('c')).toHaveClass('custom');
  });
});
