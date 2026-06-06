import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  test('renders an input element', () => {
    render(<Input aria-label="x" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('default type is text', () => {
    render(<Input aria-label="x" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  test('type prop is forwarded (email)', () => {
    render(<Input type="email" aria-label="x" />);
    expect(screen.getByLabelText('x')).toHaveAttribute('type', 'email');
  });

  test('placeholder is forwarded', () => {
    render(<Input placeholder="jane@example.com" />);
    expect(
      screen.getByPlaceholderText('jane@example.com'),
    ).toBeInTheDocument();
  });

  test('onChange fires on typing', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Input aria-label="x" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'hi');
    expect(onChange).toHaveBeenCalled();
  });

  test('disabled state', () => {
    render(<Input aria-label="x" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  test('caller className is appended', () => {
    render(<Input aria-label="x" className="custom" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom');
  });
});
