import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  test('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  test('default tone neutral + variant soft', () => {
    render(<Badge>X</Badge>);
    const el = screen.getByText('X');
    expect(el).toHaveClass('bg-surface-subtle');
    expect(el).toHaveClass('text-ink-muted');
  });

  test.each([
    ['brand', 'bg-brand/10'],
    ['success', 'bg-success-bg'],
    ['warning', 'bg-brand-accent/20'],
    ['danger', 'bg-danger-bg'],
    ['info', 'bg-info-bg'],
    ['neutral', 'bg-surface-subtle'],
  ])('soft tone "%s" applies its bg class', (tone, expected) => {
    render(<Badge tone={tone}>X</Badge>);
    expect(screen.getByText('X')).toHaveClass(expected);
  });

  test.each([
    ['brand', 'bg-brand'],
    ['success', 'bg-success'],
    ['danger', 'bg-danger'],
    ['info', 'bg-info'],
  ])('solid tone "%s" applies its bg class', (tone, expected) => {
    render(
      <Badge tone={tone} variant="solid">
        X
      </Badge>,
    );
    expect(screen.getByText('X')).toHaveClass(expected);
  });

  test('rounded-full + inline-flex base styles applied', () => {
    render(<Badge>X</Badge>);
    const el = screen.getByText('X');
    expect(el).toHaveClass('rounded-full', 'inline-flex');
  });

  test('caller className is appended', () => {
    render(<Badge className="custom">X</Badge>);
    expect(screen.getByText('X')).toHaveClass('custom');
  });
});
