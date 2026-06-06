import { render, screen } from '@testing-library/react';
import AlertCallout from './AlertCallout';

describe('AlertCallout', () => {
  test('renders children', () => {
    render(<AlertCallout>This action cannot be undone</AlertCallout>);
    expect(
      screen.getByText('This action cannot be undone'),
    ).toBeInTheDocument();
  });

  test('default tone is warning', () => {
    render(<AlertCallout>x</AlertCallout>);
    expect(screen.getByRole('status')).toHaveClass('bg-brand-accent/20');
  });

  test.each([
    ['warning', 'bg-brand-accent/20', 'status'],
    ['danger', 'bg-danger-bg', 'alert'],
    ['info', 'bg-info-bg', 'status'],
    ['success', 'bg-success-bg', 'status'],
  ])('tone "%s" applies its bg class with role=%s', (tone, expected, role) => {
    render(<AlertCallout tone={tone}>x</AlertCallout>);
    expect(screen.getByRole(role)).toHaveClass(expected);
  });

  test('renders the tone-default icon (svg present)', () => {
    render(<AlertCallout tone="danger">x</AlertCallout>);
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();
  });

  test('icon override is honoured', () => {
    const FakeIcon = (props) => <svg data-testid="custom-icon" {...props} />;
    render(<AlertCallout icon={FakeIcon}>x</AlertCallout>);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  test('caller className is appended', () => {
    render(<AlertCallout className="custom">x</AlertCallout>);
    expect(screen.getByRole('status')).toHaveClass('custom');
  });
});
