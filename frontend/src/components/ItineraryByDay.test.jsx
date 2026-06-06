import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ItineraryByDay from './ItineraryByDay';
import axiosInstance from '../axiosConfig';

jest.mock('../axiosConfig');

const renderInRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const activity = (overrides = {}) => ({
  _id: Math.random().toString(36).slice(2),
  tripId: 'trip123',
  date: '2026-06-05T00:00:00.000Z',
  time: '09:00',
  location: 'Somewhere',
  description: '',
  status: 'wishlist',
  ...overrides,
});

describe('ItineraryByDay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when activities is empty', () => {
    render(<ItineraryByDay activities={[]} />);
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  test('renders nothing when activities is null', () => {
    render(<ItineraryByDay activities={null} />);
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  test('groups activities under their respective date headings', () => {
    const activities = [
      activity({ _id: 'a', date: '2026-06-05T00:00:00.000Z', time: '09:00', location: 'Eiffel Tower' }),
      activity({ _id: 'b', date: '2026-06-05T00:00:00.000Z', time: '13:00', location: 'Louvre' }),
      activity({ _id: 'c', date: '2026-06-06T00:00:00.000Z', time: '10:00', location: 'Notre-Dame' }),
    ];
    render(<ItineraryByDay activities={activities} />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(2);
    expect(headings[0]).toHaveTextContent(/5 June 2026/);
    expect(headings[1]).toHaveTextContent(/6 June 2026/);

    const day1 = screen.getByRole('region', { name: /5 June 2026/ });
    expect(within(day1).getByText('Eiffel Tower')).toBeInTheDocument();
    expect(within(day1).getByText('Louvre')).toBeInTheDocument();
    expect(within(day1).queryByText('Notre-Dame')).not.toBeInTheDocument();

    const day2 = screen.getByRole('region', { name: /6 June 2026/ });
    expect(within(day2).getByText('Notre-Dame')).toBeInTheDocument();
  });

  test('sorts day groups chronologically regardless of input order', () => {
    const activities = [
      activity({ _id: 'b', date: '2026-06-08T00:00:00.000Z', location: 'Versailles' }),
      activity({ _id: 'a', date: '2026-06-05T00:00:00.000Z', location: 'Eiffel Tower' }),
    ];
    render(<ItineraryByDay activities={activities} />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent(/5 June/);
    expect(headings[1]).toHaveTextContent(/8 June/);
  });

  test('renders activity time, description, and status', () => {
    const activities = [
      activity({
        _id: 'a',
        date: '2026-06-05T00:00:00.000Z',
        time: '14:30',
        location: 'Eiffel Tower',
        description: 'Sunset visit',
        status: 'booked',
      }),
    ];
    render(<ItineraryByDay activities={activities} />);

    expect(screen.getByText('Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
    expect(screen.getByText('Sunset visit')).toBeInTheDocument();
    expect(screen.getByText('booked')).toBeInTheDocument();
  });

  test('renders an Edit link per activity when tripId is provided', () => {
    const activities = [
      activity({ _id: 'act1', location: 'Eiffel Tower' }),
      activity({ _id: 'act2', location: 'Louvre' }),
    ];
    renderInRouter(<ItineraryByDay activities={activities} tripId="trip123" />);

    const editLinks = screen.getAllByRole('link', { name: /edit/i });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute('href', '/trips/trip123/activities/act1/edit');
    expect(editLinks[1]).toHaveAttribute('href', '/trips/trip123/activities/act2/edit');
  });

  test('omits Edit links when tripId is not provided', () => {
    const activities = [activity({ _id: 'act1' })];
    render(<ItineraryByDay activities={activities} />);
    expect(screen.queryByRole('link', { name: /edit/i })).not.toBeInTheDocument();
  });

  test('opens the confirm dialog when a Delete button is clicked', async () => {
    const user = userEvent.setup();
    const activities = [activity({ _id: 'act1', location: 'Eiffel Tower' })];
    renderInRouter(<ItineraryByDay activities={activities} tripId="trip123" />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /delete eiffel tower/i }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/delete this activity\?/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/eiffel tower/i)).toBeInTheDocument();
  });

  test('Cancel closes the dialog without calling delete', async () => {
    const user = userEvent.setup();
    const activities = [activity({ _id: 'act1', location: 'Eiffel Tower' })];
    renderInRouter(<ItineraryByDay activities={activities} tripId="trip123" />);

    await user.click(screen.getByRole('button', { name: /delete eiffel tower/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cancel/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(axiosInstance.delete).not.toHaveBeenCalled();
  });

  test('confirms delete: calls DELETE and onActivityChanged on success', async () => {
    const user = userEvent.setup();
    const onActivityChanged = jest.fn();
    axiosInstance.delete.mockResolvedValue({ status: 204 });
    const activities = [activity({ _id: 'act1', location: 'Eiffel Tower' })];

    renderInRouter(
      <ItineraryByDay
        activities={activities}
        tripId="trip123"
        onActivityChanged={onActivityChanged}
      />,
    );

    await user.click(screen.getByRole('button', { name: /delete eiffel tower/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^delete$/i }));

    expect(axiosInstance.delete).toHaveBeenCalledWith(
      '/api/trips/trip123/activities/act1',
    );
    expect(onActivityChanged).toHaveBeenCalledTimes(1);
  });

  test('surfaces the backend error when DELETE fails', async () => {
    const user = userEvent.setup();
    axiosInstance.delete.mockRejectedValue({
      response: { data: { message: 'Activity not found' } },
    });
    const activities = [activity({ _id: 'act1', location: 'Eiffel Tower' })];

    renderInRouter(<ItineraryByDay activities={activities} tripId="trip123" />);
    await user.click(screen.getByRole('button', { name: /delete eiffel tower/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^delete$/i }));

    expect(await screen.findByText(/activity not found/i)).toBeInTheDocument();
  });

  test('renders the status toggle button with the current state', () => {
    const activities = [
      activity({ _id: 'a', location: 'Eiffel Tower', status: 'wishlist' }),
      activity({ _id: 'b', location: 'Louvre', status: 'booked' }),
    ];
    renderInRouter(<ItineraryByDay activities={activities} tripId="trip123" />);

    expect(
      screen.getByRole('button', { name: /mark eiffel tower as booked/i }),
    ).toHaveTextContent('Wishlist');
    expect(
      screen.getByRole('button', { name: /mark louvre as wishlist/i }),
    ).toHaveTextContent('Booked');
  });

  test('PATCHes the opposite status and calls onActivityChanged', async () => {
    const user = userEvent.setup();
    const onActivityChanged = jest.fn();
    axiosInstance.patch.mockResolvedValue({ data: {} });
    const activities = [activity({ _id: 'a', location: 'Eiffel Tower', status: 'wishlist' })];

    renderInRouter(
      <ItineraryByDay
        activities={activities}
        tripId="trip123"
        onActivityChanged={onActivityChanged}
      />,
    );

    await user.click(screen.getByRole('button', { name: /mark eiffel tower as booked/i }));

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      '/api/trips/trip123/activities/a/status',
      { status: 'booked' },
    );
    expect(onActivityChanged).toHaveBeenCalledTimes(1);
  });

  test('toggles a booked activity back to wishlist', async () => {
    const user = userEvent.setup();
    axiosInstance.patch.mockResolvedValue({ data: {} });
    const activities = [activity({ _id: 'b', location: 'Louvre', status: 'booked' })];

    renderInRouter(<ItineraryByDay activities={activities} tripId="trip123" />);
    await user.click(screen.getByRole('button', { name: /mark louvre as wishlist/i }));

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      '/api/trips/trip123/activities/b/status',
      { status: 'wishlist' },
    );
  });

  test('surfaces the backend error when PATCH fails', async () => {
    const user = userEvent.setup();
    axiosInstance.patch.mockRejectedValue({
      response: { data: { message: 'status must be booked or wishlist' } },
    });
    const activities = [activity({ _id: 'a', location: 'Eiffel Tower', status: 'wishlist' })];

    renderInRouter(<ItineraryByDay activities={activities} tripId="trip123" />);
    await user.click(screen.getByRole('button', { name: /mark eiffel tower as booked/i }));

    expect(await screen.findByText(/status must be booked or wishlist/i)).toBeInTheDocument();
  });
});
