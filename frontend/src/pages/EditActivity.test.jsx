import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditActivity from './EditActivity';
import axiosInstance from '../axiosConfig';

jest.mock('../axiosConfig');

const trip = {
  _id: 'trip123',
  startDate: '2026-06-01T00:00:00.000Z',
  endDate: '2026-06-10T00:00:00.000Z',
};

const activity = {
  _id: 'act1',
  tripId: 'trip123',
  date: '2026-06-05T00:00:00.000Z',
  time: '14:00',
  location: 'Eiffel Tower',
  description: 'Sunset visit',
  status: 'wishlist',
};

const renderAtRoute = (path = '/trips/trip123/activities/act1/edit') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/trips/:tripId/activities/:activityId/edit" element={<EditActivity />} />
        <Route path="/trips/:tripId" element={<div>Trip detail</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('EditActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('pre-populates the form from the loaded activity', async () => {
    axiosInstance.get.mockImplementation((url) => {
      if (url === '/api/trips/trip123') return Promise.resolve({ data: trip });
      if (url === '/api/trips/trip123/activities') return Promise.resolve({ data: [activity] });
      return Promise.reject(new Error(`unexpected ${url}`));
    });

    renderAtRoute();

    expect(await screen.findByDisplayValue('Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-06-05')).toBeInTheDocument();
    expect(screen.getByDisplayValue('14:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sunset visit')).toBeInTheDocument();
    expect(screen.getByLabelText(/wishlist/i)).toBeChecked();
    expect(screen.getByLabelText(/booked/i)).not.toBeChecked();
  });

  test('shows an error when the activity is not in the trip list', async () => {
    axiosInstance.get.mockImplementation((url) => {
      if (url === '/api/trips/trip123') return Promise.resolve({ data: trip });
      if (url === '/api/trips/trip123/activities') return Promise.resolve({ data: [] });
      return Promise.reject(new Error(`unexpected ${url}`));
    });

    renderAtRoute();

    expect(await screen.findByText(/activity not found/i)).toBeInTheDocument();
  });

  test('PUTs the form and navigates back to the trip on success', async () => {
    const user = userEvent.setup();
    axiosInstance.get.mockImplementation((url) => {
      if (url === '/api/trips/trip123') return Promise.resolve({ data: trip });
      if (url === '/api/trips/trip123/activities') return Promise.resolve({ data: [activity] });
      return Promise.reject(new Error(`unexpected ${url}`));
    });
    axiosInstance.put.mockResolvedValue({ data: { ...activity, location: 'Louvre' } });

    renderAtRoute();

    const locationInput = await screen.findByDisplayValue('Eiffel Tower');
    await user.clear(locationInput);
    await user.type(locationInput, 'Louvre');
    await user.click(screen.getByLabelText(/booked/i));
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith(
        '/api/trips/trip123/activities/act1',
        expect.objectContaining({
          location: 'Louvre',
          date: '2026-06-05',
          time: '14:00',
          status: 'booked',
        }),
      );
    });
    expect(await screen.findByText('Trip detail')).toBeInTheDocument();
  });

  test('blocks submit when date falls outside the trip range', async () => {
    const user = userEvent.setup();
    axiosInstance.get.mockImplementation((url) => {
      if (url === '/api/trips/trip123') return Promise.resolve({ data: trip });
      if (url === '/api/trips/trip123/activities') return Promise.resolve({ data: [activity] });
      return Promise.reject(new Error(`unexpected ${url}`));
    });

    renderAtRoute();

    const dateInput = await screen.findByDisplayValue('2026-06-05');
    await user.clear(dateInput);
    await user.type(dateInput, '2026-05-30');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText(/within the trip date range/i)).toBeInTheDocument();
    expect(axiosInstance.put).not.toHaveBeenCalled();
  });
});
