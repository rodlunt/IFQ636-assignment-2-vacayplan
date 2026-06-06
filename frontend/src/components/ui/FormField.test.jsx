import { render, screen } from '@testing-library/react';
import FormField from './FormField';
import Input from './Input';
import Textarea from './Textarea';

describe('FormField', () => {
  test('renders label and child input together', () => {
    render(
      <FormField label="Email">
        <Input />
      </FormField>,
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  test('label htmlFor is wired to the auto-generated child id', () => {
    render(
      <FormField label="Email">
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText('Email');
    const label = screen.getByText('Email').closest('label');
    expect(label).toHaveAttribute('for', input.id);
    expect(input.id).not.toBe('');
  });

  test('respects an explicit id on the child', () => {
    render(
      <FormField label="Email">
        <Input id="my-email" />
      </FormField>,
    );
    const input = screen.getByLabelText('Email');
    expect(input.id).toBe('my-email');
  });

  test('helper text renders below the input', () => {
    render(
      <FormField label="Email" helper="Used for sign in">
        <Input />
      </FormField>,
    );
    expect(screen.getByText('Used for sign in')).toBeInTheDocument();
  });

  test('error text replaces helper text when present', () => {
    render(
      <FormField
        label="Email"
        helper="Used for sign in"
        error="Email is required"
      >
        <Input />
      </FormField>,
    );
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.queryByText('Used for sign in')).not.toBeInTheDocument();
  });

  test('aria-invalid + aria-describedby wire to the error id', () => {
    render(
      <FormField label="Email" error="Email is required">
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy)).toHaveTextContent(
      'Email is required',
    );
  });

  test('aria-describedby points at helper id when no error', () => {
    render(
      <FormField label="Email" helper="Used for sign in">
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText('Email');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy)).toHaveTextContent(
      'Used for sign in',
    );
  });

  test('required marker renders and propagates to child', () => {
    render(
      <FormField label="Email" required>
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText(/Email/);
    expect(input).toBeRequired();
  });

  test('works with Textarea as child', () => {
    render(
      <FormField label="Notes">
        <Textarea />
      </FormField>,
    );
    const textarea = screen.getByLabelText('Notes');
    expect(textarea.tagName).toBe('TEXTAREA');
  });
});
