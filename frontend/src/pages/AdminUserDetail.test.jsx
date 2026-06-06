import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminUserDetail from './AdminUserDetail';
import axiosInstance from '../axiosConfig';

jest.mock('../axiosConfig');

const objectIdAt = (seconds, suffix = '0000000000000000') => {
  const hex = Math.floor(seconds).toString(16).padStart(8, '0');
  return hex + suffix;
};

const renderAtRoute = (id = 'user1') =>
  render(
    <MemoryRouter initialEntries={[`/admin/users/${id}`]}>
      <Routes>
        <Route path="/admin/users/:id" element={<AdminUserDetail />} />
        <Route path="/admin/users" element={<div>Admin user list</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('AdminUserDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders profile fields and trips table for a user with trips', async () => {
    const userObjectId = objectIdAt(new Date('2026-05-20T00:00:00Z').getTime() / 1000, 'aaaaaaaaaaaaaaaa');
    axiosInstance.get.mockResolvedValue({
      data: {
        _id: userObjectId,
        name: 'Marker Test',
        email: 'marker@vacayplan.com',
        isAdmin: false,
        status: 'active',
        trips: [
          {
            _id: 'trip1',
            destination: 'Paris',
            title: 'Honeymoon',
            startDate: '2026-06-01T00:00:00.000Z',
            endDate: '2026-06-10T00:00:00.000Z',
            budget: 5000,
          },
          {
            _id: 'trip2',
            destination: 'Rome',
            title: null,
            startDate: '2026-07-15T00:00:00.000Z',
            endDate: '2026-07-22T00:00:00.000Z',
            budget: null,
          },
        ],
      },
    });

    renderAtRoute(userObjectId);

    const profileHeader = await screen.findByTestId('user-profile-header');
    expect(profileHeader).toHaveTextContent('User · marker@vacayplan.com');
    expect(axiosInstance.get).toHaveBeenCalledWith(`/api/admin/users/${userObjectId}`);

    expect(screen.getByText('Marker Test')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('20 May 2026')).toBeInTheDocument();

    expect(screen.getByTestId('user-trip-count')).toHaveTextContent('Trips (2)');
    const tripRows = within(screen.getByRole('table')).getAllByRole('row');
    expect(tripRows).toHaveLength(3);

    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Honeymoon')).toBeInTheDocument();
    expect(screen.getByText('1 June 2026 – 10 June 2026')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();

    expect(screen.getByText('Rome')).toBeInTheDocument();
    expect(screen.getByText('15 July 2026 – 22 July 2026')).toBeInTheDocument();
  });

  test('shows an empty-trips message when the user has no trips', async () => {
    const userObjectId = objectIdAt(new Date('2026-05-25T00:00:00Z').getTime() / 1000, 'bbbbbbbbbbbbbbbb');
    axiosInstance.get.mockResolvedValue({
      data: {
        _id: userObjectId,
        name: '',
        email: 'newuser@test.com',
        isAdmin: false,
        status: 'active',
        trips: [],
      },
    });

    renderAtRoute(userObjectId);

    const tripCount = await screen.findByTestId('user-trip-count');
    expect(tripCount).toHaveTextContent('Trips (0)');
    expect(screen.getByText(/this user has no trips/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('shows a 404 message when the user does not exist', async () => {
    axiosInstance.get.mockRejectedValue({
      response: { status: 404, data: { message: 'User not found' } },
    });

    renderAtRoute('missing');

    expect(await screen.findByText(/User not found\./)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to admin users/i })).toBeInTheDocument();
  });

  test('shows a generic error when the request fails without a server payload', async () => {
    axiosInstance.get.mockRejectedValue(new Error('network down'));

    renderAtRoute('user1');

    expect(await screen.findByText(/Failed to load user\./)).toBeInTheDocument();
  });

  test('surfaces a 403 forbidden message from the server', async () => {
    axiosInstance.get.mockRejectedValue({
      response: { status: 403, data: { message: 'Admin access required' } },
    });

    renderAtRoute('user1');

    expect(await screen.findByText(/Admin access required/)).toBeInTheDocument();
  });
});
