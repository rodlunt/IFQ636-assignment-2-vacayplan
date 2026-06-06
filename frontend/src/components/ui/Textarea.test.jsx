import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Textarea from './Textarea';

describe('Textarea', () => {
  test('renders a textarea element', () => {
    render(<Textarea aria-label="x" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('default rows is 4', () => {
    render(<Textarea aria-label="x" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4');
  });

  test('rows prop is forwarded', () => {
    render(<Textarea aria-label="x" rows={8} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '8');
  });

  test('placeholder is forwarded', () => {
    render(<Textarea placeholder="Notes about the trip" />);
    expect(
      screen.getByPlaceholderText('Notes about the trip'),
    ).toBeInTheDocument();
  });

  test('onChange fires on typing', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Textarea aria-label="x" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'hi');
    expect(onChange).toHaveBeenCalled();
  });

  test('disabled state', () => {
    render(<Textarea aria-label="x" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  test('caller className is appended', () => {
    render(<Textarea aria-label="x" className="custom" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom');
  });
});
