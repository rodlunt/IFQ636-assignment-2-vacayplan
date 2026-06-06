import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  MapIcon,
  CheckBadgeIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import axiosInstance from '../axiosConfig';
import AppShell from '../components/layout/AppShell';
import PageContainer from '../components/layout/PageContainer';
import Breadcrumb from '../components/ui/Breadcrumb';
import AlertCallout from '../components/ui/AlertCallout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Dialog from '../components/ui/Dialog';
import FormField from '../components/ui/FormField';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import StatsCard from '../components/dashboard/StatsCard';
import AdminTripsSection from '../components/admin/AdminTripsSection';

const shortUserId = (id) => {
  if (typeof id !== 'string' || id.length === 0) return '???';
  return id.slice(-3).toUpperCase();
};

const registrationDateFromObjectId = (id) => {
  if (typeof id !== 'string' || id.length < 8) return null;
  const seconds = parseInt(id.substring(0, 8), 16);
  if (!Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000);
};

const formatRegistered = (user) => {
  const date = registrationDateFromObjectId(user._id);
  if (!date || Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [pendingToggle, setPendingToggle] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toggleError, setToggleError] = useState('');

  const [pendingDelete, setPendingDelete] = useState(null);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', isAdmin: false });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        const [usersRes, tripsRes] = await Promise.all([
          axiosInstance.get('/api/admin/users'),
          axiosInstance.get('/api/admin/trips').catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;
        setUsers(usersRes.data);
        setTrips((tripsRes.data || []).filter((t) => t && t.destination));
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load users.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalUsers = users.length;
  const totalTrips = trips.length;
  const activeTrips = trips.filter((t) => t.status === 'active').length;

  const requestToggle = (user) => {
    setToggleError('');
    setPendingToggle(user);
  };

  const closeConfirm = () => {
    if (submitting) return;
    setPendingToggle(null);
    setToggleError('');
  };

  const performToggle = async () => {
    if (!pendingToggle) return;
    const nextStatus = pendingToggle.status === 'deactivated' ? 'active' : 'deactivated';
    setSubmitting(true);
    setToggleError('');
    try {
      const response = await axiosInstance.patch(
        `/api/admin/users/${pendingToggle._id}`,
        { status: nextStatus },
      );
      setUsers((prev) =>
        prev.map((u) =>
          u._id === pendingToggle._id ? { ...u, status: response.data.status } : u,
        ),
      );
      setPendingToggle(null);
    } catch (err) {
      setToggleError(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setSubmitting(false);
    }
  };

  const requestDelete = (user) => {
    setDeleteError('');
    setConfirmEmail('');
    setPendingDelete(user);
  };

  const closeDelete = () => {
    if (deleting) return;
    setPendingDelete(null);
    setConfirmEmail('');
    setDeleteError('');
  };

  const performDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await axiosInstance.delete(`/api/admin/users/${pendingDelete._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== pendingDelete._id));
      setPendingDelete(null);
      setConfirmEmail('');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => {
    setCreateError('');
    setCreateForm({ name: '', email: '', password: '', isAdmin: false });
    setCreateOpen(true);
  };

  const closeCreate = () => {
    if (creating) return;
    setCreateOpen(false);
    setCreateError('');
  };

  const performCreate = async (event) => {
    event.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const response = await axiosInstance.post('/api/admin/users', createForm);
      setUsers((prev) => [response.data, ...prev]);
      setCreateOpen(false);
      setCreateForm({ name: '', email: '', password: '', isAdmin: false });
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <PageContainer variant="wide">
          <p className="text-ink-muted">Loading users…</p>
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageContainer variant="wide">
        <Breadcrumb
          className="mb-4"
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Admin · Users' },
          ]}
        />

        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-ink">Admin · Users</h1>
            <Badge tone="brand" variant="soft">Admin Mode</Badge>
          </div>
          <Button variant="primary" size="md" onClick={openCreate}>
            + Add User
          </Button>
        </div>

        <section
          aria-label="Admin stats"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          <StatsCard
            label="Total Users"
            value={totalUsers}
            icon={UsersIcon}
            subtext="All registered"
          />
          <StatsCard
            label="Total Trips"
            value={totalTrips}
            icon={MapIcon}
            subtext="Across all accounts"
          />
          <StatsCard
            label="Active Trips"
            value={activeTrips}
            icon={CheckBadgeIcon}
            subtext="Currently in progress"
          />
          <StatsCard
            label="Flagged Items"
            value={0}
            icon={FlagIcon}
            subtext="Require attention"
          />
        </section>

        {error ? (
          <div className="mb-4">
            <AlertCallout tone="danger" className="self-start">{error}</AlertCallout>
          </div>
        ) : null}

        {!error && users.length === 0 ? (
          <p className="text-ink-muted">No users registered.</p>
        ) : null}

        {users.length > 0 ? (
          <div className="overflow-x-auto bg-surface border border-surface-border rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-subtle text-left">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">User</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Email</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Role</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Registered</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-surface-border">
                    <td className="px-4 py-3 text-ink">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name || user.email} size="md" />
                        <div className="min-w-0">
                          <div className="font-medium text-ink truncate">
                            {user.name || '—'}
                          </div>
                          <div className="text-xs text-ink-muted">
                            USR-{shortUserId(user._id)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink">{user.email}</td>
                    <td className="px-4 py-3 text-ink">{user.isAdmin ? 'Admin' : 'User'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          user.status === 'deactivated' ? 'text-danger' : 'text-success'
                        }
                      >
                        {user.status === 'deactivated' ? 'Deactivated' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink">{formatRegistered(user)}</td>
                    <td className="px-4 py-3 space-x-3 whitespace-nowrap">
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="text-brand hover:underline"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => requestToggle(user)}
                        className={
                          user.status === 'deactivated'
                            ? 'text-success hover:underline'
                            : 'text-danger hover:underline'
                        }
                        aria-label={
                          user.status === 'deactivated'
                            ? `Reactivate ${user.email}`
                            : `Deactivate ${user.email}`
                        }
                      >
                        {user.status === 'deactivated' ? 'Reactivate' : 'Deactivate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(user)}
                        className="text-danger hover:underline font-medium"
                        aria-label={`Delete ${user.email}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <AdminTripsSection trips={trips} />

        <ConfirmDialog
          isOpen={Boolean(pendingToggle)}
          title={
            pendingToggle?.status === 'deactivated'
              ? 'Reactivate user?'
              : 'Deactivate user?'
          }
          body={
            pendingToggle
              ? pendingToggle.status === 'deactivated'
                ? (
                  <>Restore access for <strong>{pendingToggle.email}</strong>.</>
                )
                : (
                  <>Block sign-in for <strong>{pendingToggle.email}</strong>. They can be reactivated later.</>
                )
              : ''
          }
          confirmLabel={
            pendingToggle?.status === 'deactivated' ? 'Reactivate' : 'Deactivate'
          }
          loadingLabel={
            pendingToggle?.status === 'deactivated' ? 'Reactivating…' : 'Deactivating…'
          }
          cancelLabel="Cancel"
          destructive={pendingToggle?.status !== 'deactivated'}
          loading={submitting}
          error={toggleError}
          onConfirm={performToggle}
          onCancel={closeConfirm}
        />

        <Dialog
          open={Boolean(pendingDelete)}
          onClose={closeDelete}
          title="Delete user permanently?"
        >
          {pendingDelete ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (confirmEmail === pendingDelete.email) performDelete();
              }}
              className="flex flex-col gap-3"
            >
              <p className="text-center">
                This will permanently delete <strong>{pendingDelete.email}</strong> and cascade-delete all their trips and activities. This action cannot be undone.
              </p>
              <FormField label={`Type ${pendingDelete.email} to confirm`}>
                <Input
                  id="confirm-delete-email"
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  disabled={deleting}
                  autoComplete="off"
                />
              </FormField>
              {deleteError ? (
                <AlertCallout tone="danger" className="self-start">{deleteError}</AlertCallout>
              ) : null}
              <div className="flex gap-3 mt-2">
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={deleting || confirmEmail !== pendingDelete.email}
                  className="flex-1"
                >
                  {deleting ? 'Deleting…' : 'Delete permanently'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeDelete}
                  disabled={deleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </Dialog>

        <Dialog
          open={createOpen}
          onClose={closeCreate}
          title="Create New User"
        >
          <form onSubmit={performCreate} className="flex flex-col gap-3">
            <p className="text-center text-sm">
              Add a new user to the system. They will be able to sign in immediately.
            </p>
            <FormField label="Full name" required>
              <Input
                id="create-name"
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                disabled={creating}
                autoComplete="off"
                placeholder="e.g. Jordan Reyes"
              />
            </FormField>
            <FormField label="Email" required>
              <Input
                id="create-email"
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                disabled={creating}
                autoComplete="off"
                placeholder="jordan@example.com"
              />
            </FormField>
            <FormField label="Password" required>
              <Input
                id="create-password"
                type="password"
                required
                minLength={8}
                value={createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                disabled={creating}
                autoComplete="new-password"
                placeholder="8+ characters"
              />
            </FormField>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={createForm.isAdmin}
                onChange={(e) => setCreateForm((f) => ({ ...f, isAdmin: e.target.checked }))}
                disabled={creating}
              />
              <span className="text-sm text-ink">Make this user an administrator</span>
            </label>
            {createError ? (
              <AlertCallout tone="danger" className="self-start">{createError}</AlertCallout>
            ) : null}
            <div className="flex gap-3 mt-2">
              <Button type="submit" variant="primary" disabled={creating} className="flex-1">
                {creating ? 'Creating…' : 'Create User'}
              </Button>
              <Button type="button" variant="secondary" onClick={closeCreate} disabled={creating} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Dialog>
      </PageContainer>
    </AppShell>
  );
};

export default AdminUserList;
