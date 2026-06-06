import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  test('renders children', () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole('button', { name: 'Click me' }),
    ).toBeInTheDocument();
  });

  test('default variant is primary (brand background)', () => {
    render(<Button>X</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-brand');
  });

  test('default size is md (text-sm)', () => {
    render(<Button>X</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-sm');
  });

  test.each([
    ['primary', 'bg-brand'],
    ['secondary', 'border-surface-border'],
    ['destructive', 'bg-danger'],
    ['destructive-soft', 'bg-danger-bg'],
    ['ghost-brand', 'text-brand'],
  ])('variant "%s" applies its visual class (%s)', (variant, expected) => {
    render(<Button variant={variant}>X</Button>);
    expect(screen.getByRole('button')).toHaveClass(expected);
  });

  test.each([
    ['sm', 'text-xs'],
    ['md', 'text-sm'],
  ])('size "%s" applies its size class (%s)', (size, expected) => {
    render(<Button size={size}>X</Button>);
    expect(screen.getByRole('button')).toHaveClass(expected);
  });

  test('click handler fires', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>X</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disabled prevents click', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <Button onClick={onClick} disabled>
        X
      </Button>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  test('renders leftIcon when provided', () => {
    const FakeIcon = (props) => <svg data-testid="left-icon" {...props} />;
    render(<Button leftIcon={FakeIcon}>X</Button>);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  test('forwards className for caller override', () => {
    render(<Button className="custom-class">X</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  test('default type is button (prevents accidental form submit)', () => {
    render(<Button>X</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  test('type can be overridden to submit', () => {
    render(<Button type="submit">Save</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  test('unknown variant falls back to primary safely', () => {
    render(<Button variant="bogus">X</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-brand');
  });
});
