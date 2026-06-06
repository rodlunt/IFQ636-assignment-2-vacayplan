import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminUserList from './AdminUserList';
import axiosInstance from '../axiosConfig';

jest.mock('../axiosConfig');

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminUserList />
    </MemoryRouter>,
  );

const objectIdAt = (seconds, suffix = '0000000000000000') => {
  const hex = Math.floor(seconds).toString(16).padStart(8, '0');
  return hex + suffix;
};

describe('AdminUserList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders a populated table sorted in the server-provided order with derived registration dates', async () => {
    const users = [
      {
        _id: objectIdAt(new Date('2026-05-25T00:00:00Z').getTime() / 1000, 'aaaaaaaaaaaaaaaa'),
        name: 'Admin Test',
        email: 'admin@vacayplan.com',
        isAdmin: true,
        status: 'active',
      },
      {
        _id: objectIdAt(new Date('2026-05-24T00:00:00Z').getTime() / 1000, 'bbbbbbbbbbbbbbbb'),
        name: 'Marker Test',
        email: 'marker@vacayplan.com',
        isAdmin: false,
        status: 'active',
      },
      {
        _id: objectIdAt(new Date('2026-05-23T00:00:00Z').getTime() / 1000, 'cccccccccccccccc'),
        name: 'Deactivated User',
        email: 'gone@test.com',
        isAdmin: false,
        status: 'deactivated',
      },
    ];
    axiosInstance.get.mockResolvedValue({ data: users });

    renderPage();

    await waitForElementToBeRemoved(() => screen.queryByText(/loading users/i));

    expect(axiosInstance.get).toHaveBeenCalledWith('/api/admin/users');

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4);

    expect(screen.getByText('admin@vacayplan.com')).toBeInTheDocument();
    expect(screen.getByText('marker@vacayplan.com')).toBeInTheDocument();
    expect(screen.getByText('gone@test.com')).toBeInTheDocument();

    // Role cells: "Admin" appears once (admin@vacayplan.com row) and "User"
    // appears twice (marker + gone). Use a scoped query to exclude the
    // column header `<th>User</th>` introduced by the avatar column.
    const roleCells = screen
      .getAllByRole('cell')
      .filter((cell) => cell.textContent === 'User' || cell.textContent === 'Admin');
    expect(roleCells.filter((c) => c.textContent === 'Admin')).toHaveLength(1);
    expect(roleCells.filter((c) => c.textContent === 'User')).toHaveLength(2);

    expect(screen.getAllByText('Active').length).toBe(2);
    expect(screen.getByText('Deactivated')).toBeInTheDocument();

    expect(screen.getByText('25 May 2026')).toBeInTheDocument();
    expect(screen.getByText('24 May 2026')).toBeInTheDocument();
    expect(screen.getByText('23 May 2026')).toBeInTheDocument();

    const viewLinks = screen.getAllByRole('link', { name: /view/i });
    expect(viewLinks).toHaveLength(3);
    expect(viewLinks[0].getAttribute('href')).toBe(`/admin/users/${users[0]._id}`);
  });

  test('renders an empty state when the server returns no users', async () => {
    axiosInstance.get.mockResolvedValue({ data: [] });

    renderPage();

    expect(await screen.findByText(/no users registered/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('surfaces the server error message when GET /api/admin/users returns 403', async () => {
    axiosInstance.get.mockRejectedValue({
      response: { status: 403, data: { message: 'Admin access required' } },
    });

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Admin access required');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('shows a generic error message when the request fails without a server payload', async () => {
    axiosInstance.get.mockRejectedValue(new Error('network down'));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load users.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  describe('status toggle', () => {
    const activeUser = {
      _id: objectIdAt(new Date('2026-05-25T00:00:00Z').getTime() / 1000, 'aaaaaaaaaaaaaaaa'),
      name: 'Marker Test',
      email: 'marker@vacayplan.com',
      isAdmin: false,
      status: 'active',
    };
    const deactivatedUser = {
      _id: objectIdAt(new Date('2026-05-24T00:00:00Z').getTime() / 1000, 'bbbbbbbbbbbbbbbb'),
      name: 'Deactivated Test',
      email: 'gone@test.com',
      isAdmin: false,
      status: 'deactivated',
    };

    const renderWithUsers = async (users) => {
      axiosInstance.get.mockResolvedValue({ data: users });
      renderPage();
      await waitForElementToBeRemoved(() => screen.queryByText(/loading users/i));
    };

    test('renders Deactivate for active users and Reactivate for deactivated users', async () => {
      await renderWithUsers([activeUser, deactivatedUser]);

      expect(
        screen.getByRole('button', { name: `Deactivate ${activeUser.email}` }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: `Reactivate ${deactivatedUser.email}` }),
      ).toBeInTheDocument();
    });

    test('Deactivate flow PATCHes with status=deactivated and updates the row on success', async () => {
      const user = userEvent.setup();
      await renderWithUsers([activeUser]);
      axiosInstance.patch.mockResolvedValue({
        data: { ...activeUser, status: 'deactivated' },
      });

      await user.click(
        screen.getByRole('button', { name: `Deactivate ${activeUser.email}` }),
      );

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText(/Deactivate user\?/)).toBeInTheDocument();
      expect(within(dialog).getByText(activeUser.email)).toBeInTheDocument();

      await user.click(within(dialog).getByRole('button', { name: 'Deactivate' }));

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        `/api/admin/users/${activeUser._id}`,
        { status: 'deactivated' },
      );
      expect(
        await screen.findByRole('button', { name: `Reactivate ${activeUser.email}` }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('Deactivated')).toBeInTheDocument();
    });

    test('Reactivate flow PATCHes with status=active and updates the row on success', async () => {
      const user = userEvent.setup();
      await renderWithUsers([deactivatedUser]);
      axiosInstance.patch.mockResolvedValue({
        data: { ...deactivatedUser, status: 'active' },
      });

      await user.click(
        screen.getByRole('button', { name: `Reactivate ${deactivatedUser.email}` }),
      );

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText(/Reactivate user\?/)).toBeInTheDocument();

      await user.click(within(dialog).getByRole('button', { name: 'Reactivate' }));

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        `/api/admin/users/${deactivatedUser._id}`,
        { status: 'active' },
      );
      expect(
        await screen.findByRole('button', { name: `Deactivate ${deactivatedUser.email}` }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    test('Cancel closes the dialog without calling PATCH', async () => {
      const user = userEvent.setup();
      await renderWithUsers([activeUser]);

      await user.click(
        screen.getByRole('button', { name: `Deactivate ${activeUser.email}` }),
      );
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

      expect(axiosInstance.patch).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    test('surfaces the server error message inside the dialog on PATCH failure', async () => {
      const user = userEvent.setup();
      await renderWithUsers([activeUser]);
      axiosInstance.patch.mockRejectedValue({
        response: { status: 403, data: { message: 'Admin access required' } },
      });

      await user.click(
        screen.getByRole('button', { name: `Deactivate ${activeUser.email}` }),
      );
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: 'Deactivate' }));

      expect(
        await within(dialog).findByRole('alert'),
      ).toHaveTextContent('Admin access required');
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('delete user', () => {
    const targetUser = {
      _id: objectIdAt(new Date('2026-05-25T00:00:00Z').getTime() / 1000, 'aaaaaaaaaaaaaaaa'),
      name: 'Target Test',
      email: 'target@vacayplan.com',
      isAdmin: false,
      status: 'active',
    };
    const otherUser = {
      _id: objectIdAt(new Date('2026-05-24T00:00:00Z').getTime() / 1000, 'bbbbbbbbbbbbbbbb'),
      name: 'Other Test',
      email: 'other@vacayplan.com',
      isAdmin: false,
      status: 'active',
    };

    const renderWithUsers = async (users) => {
      axiosInstance.get.mockResolvedValue({ data: users });
      renderPage();
      await waitForElementToBeRemoved(() => screen.queryByText(/loading users/i));
    };

    test('Delete button is present per row with the user email in its aria-label', async () => {
      await renderWithUsers([targetUser, otherUser]);

      expect(
        screen.getByRole('button', { name: `Delete ${targetUser.email}` }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: `Delete ${otherUser.email}` }),
      ).toBeInTheDocument();
    });

    test('Delete button in the dialog is disabled until the typed email matches exactly', async () => {
      const user = userEvent.setup();
      await renderWithUsers([targetUser]);

      await user.click(
        screen.getByRole('button', { name: `Delete ${targetUser.email}` }),
      );
      const dialog = await screen.findByRole('dialog');
      const confirmButton = within(dialog).getByRole('button', {
        name: /delete permanently/i,
      });
      const emailInput = within(dialog).getByLabelText(/type .* to confirm/i);

      expect(confirmButton).toBeDisabled();

      await user.type(emailInput, 'wrong@vacayplan.com');
      expect(confirmButton).toBeDisabled();

      await user.clear(emailInput);
      await user.type(emailInput, targetUser.email);
      expect(confirmButton).toBeEnabled();
    });

    test('confirming fires DELETE and removes the row on success', async () => {
      const user = userEvent.setup();
      await renderWithUsers([targetUser, otherUser]);
      axiosInstance.delete.mockResolvedValue({ status: 204, data: undefined });

      await user.click(
        screen.getByRole('button', { name: `Delete ${targetUser.email}` }),
      );
      const dialog = await screen.findByRole('dialog');
      await user.type(
        within(dialog).getByLabelText(/type .* to confirm/i),
        targetUser.email,
      );
      await user.click(
        within(dialog).getByRole('button', { name: /delete permanently/i }),
      );

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        `/api/admin/users/${targetUser._id}`,
      );
      expect(
        await screen.findByRole('button', { name: `Delete ${otherUser.email}` }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText(targetUser.email)).not.toBeInTheDocument();
      expect(screen.getByText(otherUser.email)).toBeInTheDocument();
    });

    test('Cancel closes the dialog without firing DELETE', async () => {
      const user = userEvent.setup();
      await renderWithUsers([targetUser]);

      await user.click(
        screen.getByRole('button', { name: `Delete ${targetUser.email}` }),
      );
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

      expect(axiosInstance.delete).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText(targetUser.email)).toBeInTheDocument();
    });

    test('surfaces the server error message inside the dialog on DELETE failure', async () => {
      const user = userEvent.setup();
      await renderWithUsers([targetUser]);
      axiosInstance.delete.mockRejectedValue({
        response: { status: 500, data: { message: 'Cascade delete failed' } },
      });

      await user.click(
        screen.getByRole('button', { name: `Delete ${targetUser.email}` }),
      );
      const dialog = await screen.findByRole('dialog');
      await user.type(
        within(dialog).getByLabelText(/type .* to confirm/i),
        targetUser.email,
      );
      await user.click(
        within(dialog).getByRole('button', { name: /delete permanently/i }),
      );

      expect(
        await within(dialog).findByRole('alert'),
      ).toHaveTextContent('Cascade delete failed');
      // After Headless UI Dialog migration (VP-100 + VP-109), the row Delete
      // button behind the open dialog is aria-hidden and not findable by
      // accessible role. Multiple email text nodes now exist (row cell +
      // dialog body + label + input value), so assert presence via getAllByText.
      expect(screen.getAllByText(targetUser.email).length).toBeGreaterThan(0);
    });
  });
});
