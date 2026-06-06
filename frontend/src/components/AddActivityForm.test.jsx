import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddActivityForm from './AddActivityForm';
import axiosInstance from '../axiosConfig';

jest.mock('../axiosConfig');

const tripProps = {
  tripId: 'trip123',
  tripStartDate: '2026-06-01T00:00:00.000Z',
  tripEndDate: '2026-06-10T00:00:00.000Z',
};

describe('AddActivityForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the toggle button when collapsed', () => {
    render(<AddActivityForm {...tripProps} />);
    expect(screen.getByRole('button', { name: /\+ add activity/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/location/i)).not.toBeInTheDocument();
  });

  test('opens the form when the toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<AddActivityForm {...tripProps} />);
    await user.click(screen.getByRole('button', { name: /\+ add activity/i }));

    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  test('shows a validation error when location is missing', async () => {
    const user = userEvent.setup();
    render(<AddActivityForm {...tripProps} />);
    await user.click(screen.getByRole('button', { name: /\+ add activity/i }));
    await user.click(screen.getByRole('button', { name: /^add activity$/i }));

    expect(await screen.findByText(/location is required/i)).toBeInTheDocument();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  test('shows a validation error when the date is outside the trip range', async () => {
    const user = userEvent.setup();
    render(<AddActivityForm {...tripProps} />);
    await user.click(screen.getByRole('button', { name: /\+ add activity/i }));
    await user.type(screen.getByLabelText(/location/i), 'Louvre');
    await user.type(screen.getByLabelText(/^date/i), '2026-05-30');
    await user.type(screen.getByLabelText(/^time/i), '10:00');
    await user.click(screen.getByRole('button', { name: /^add activity$/i }));

    expect(await screen.findByText(/within the trip date range/i)).toBeInTheDocument();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  test('POSTs the new activity and calls onActivityAdded on success', async () => {
    const user = userEvent.setup();
    const onActivityAdded = jest.fn();
    const newActivity = {
      _id: 'act1',
      tripId: 'trip123',
      location: 'Eiffel Tower',
      date: '2026-06-05T00:00:00.000Z',
      time: '14:00',
      status: 'wishlist',
    };
    axiosInstance.post.mockResolvedValue({ data: newActivity });

    render(<AddActivityForm {...tripProps} onActivityAdded={onActivityAdded} />);
    await user.click(screen.getByRole('button', { name: /\+ add activity/i }));
    await user.type(screen.getByLabelText(/location/i), 'Eiffel Tower');
    await user.type(screen.getByLabelText(/^date/i), '2026-06-05');
    await user.type(screen.getByLabelText(/^time/i), '14:00');
    await user.click(screen.getByRole('button', { name: /^add activity$/i }));

    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/api/trips/trip123/activities',
      {
        date: '2026-06-05',
        time: '14:00',
        location: 'Eiffel Tower',
      },
    );
    expect(onActivityAdded).toHaveBeenCalledWith(newActivity);
  });

  test('surfaces the backend error message when POST fails', async () => {
    const user = userEvent.setup();
    axiosInstance.post.mockRejectedValue({
      response: { data: { message: 'Trip not found' } },
    });

    render(<AddActivityForm {...tripProps} />);
    await user.click(screen.getByRole('button', { name: /\+ add activity/i }));
    await user.type(screen.getByLabelText(/location/i), 'Louvre');
    await user.type(screen.getByLabelText(/^date/i), '2026-06-05');
    await user.type(screen.getByLabelText(/^time/i), '10:00');
    await user.click(screen.getByRole('button', { name: /^add activity$/i }));

    expect(await screen.findByText(/trip not found/i)).toBeInTheDocument();
  });
});
