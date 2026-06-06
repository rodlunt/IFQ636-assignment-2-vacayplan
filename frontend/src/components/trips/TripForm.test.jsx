import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TripForm from './TripForm';

const renderForm = (props = {}) => render(<TripForm {...props} />);

describe('TripForm', () => {
  it('renders all labelled fields', () => {
    renderForm();
    expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Destination/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/End date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Budget/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/)).toBeInTheDocument();
  });

  it('pre-populates from initialValues', () => {
    renderForm({
      initialValues: {
        title: 'Tokyo trip',
        destination: 'Tokyo, Japan',
        startDate: '2026-09-03',
        endDate: '2026-09-10',
        budget: '3100',
        notes: 'first japan trip',
      },
    });
    expect(screen.getByLabelText(/Title/)).toHaveValue('Tokyo trip');
    expect(screen.getByLabelText(/Destination/)).toHaveValue('Tokyo, Japan');
    expect(screen.getByLabelText(/Start date/)).toHaveValue('2026-09-03');
    expect(screen.getByLabelText(/End date/)).toHaveValue('2026-09-10');
  });

  it('rejects submit with empty destination + shows validation error', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderForm({ onSubmit, submitLabel: 'Create Trip' });

    await user.click(screen.getByRole('button', { name: 'Create Trip' }));
    expect(screen.getByText(/Destination is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects endDate before startDate', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderForm({ onSubmit, submitLabel: 'Create Trip' });

    await user.type(screen.getByLabelText(/Destination/), 'Bali');
    await user.type(screen.getByLabelText(/Start date/), '2026-07-10');
    await user.type(screen.getByLabelText(/End date/), '2026-07-01');
    await user.click(screen.getByRole('button', { name: 'Create Trip' }));
    expect(screen.getByText(/End date must be on or after start date/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with normalized payload when valid', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderForm({ onSubmit, submitLabel: 'Create Trip' });

    await user.type(screen.getByLabelText(/Destination/), 'Bali');
    await user.type(screen.getByLabelText(/Start date/), '2026-06-12');
    await user.type(screen.getByLabelText(/End date/), '2026-06-19');
    await user.type(screen.getByLabelText(/Budget/), '2400');
    await user.click(screen.getByRole('button', { name: 'Create Trip' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toMatchObject({
      destination: 'Bali',
      startDate: '2026-06-12',
      endDate: '2026-06-19',
      budget: 2400,
      title: null,
      notes: null,
    });
  });

  it('renders externalError when passed', () => {
    renderForm({ externalError: 'Server exploded.' });
    expect(screen.getByText('Server exploded.')).toBeInTheDocument();
  });

  it('Cancel button calls onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    renderForm({ onCancel });
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
