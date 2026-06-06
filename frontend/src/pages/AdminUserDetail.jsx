import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import AppShell from '../components/layout/AppShell';
import PageContainer from '../components/layout/PageContainer';
import Breadcrumb from '../components/ui/Breadcrumb';
import AlertCallout from '../components/ui/AlertCallout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const registrationDateFromObjectId = (id) => {
  if (typeof id !== 'string' || id.length < 8) return null;
  const seconds = parseInt(id.substring(0, 8), 16);
  if (!Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000);
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateRange = (start, end) => {
  if (!start || !end) return '—';
  return `${formatDate(start)} – ${formatDate(end)}`;
};

const formatBudget = (amount) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const AdminUserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(`/api/admin/users/${id}`);
        setUser(response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('User not found.');
        } else {
          setError(err.response?.data?.message || 'Failed to load user.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <PageContainer>
          <p className="text-ink-muted">Loading user…</p>
        </PageContainer>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <PageContainer>
          <div className="flex flex-col gap-3">
            <AlertCallout tone="danger" className="self-start">{error}</AlertCallout>
            <Link to="/admin/users" className="text-brand hover:underline">
              ← Back to admin users
            </Link>
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  const trips = user?.trips || [];

  return (
    <AppShell>
      <PageContainer>
        <Breadcrumb
          className="mb-4"
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Admin · Users', to: '/admin/users' },
            { label: user.email },
          ]}
        />

        <h1
          data-testid="user-profile-header"
          className="text-3xl font-bold text-ink mt-1 mb-6"
        >
          User · {user.email}
        </h1>

        <Card padding="md" className="mb-6">
          <h2 className="text-xl font-semibold text-ink mb-3">Profile</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="font-medium text-ink-muted">Name</dt>
              <dd className="text-ink">{user.name || '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink-muted">Email</dt>
              <dd className="text-ink">{user.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink-muted">Role</dt>
              <dd className="text-ink">{user.isAdmin ? 'Admin' : 'User'}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink-muted">Status</dt>
              <dd>
                <Badge
                  tone={user.status === 'deactivated' ? 'danger' : 'success'}
                  variant="soft"
                >
                  {user.status === 'deactivated' ? 'Deactivated' : 'Active'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink-muted">Registered</dt>
              <dd className="text-ink">{formatDate(registrationDateFromObjectId(user._id))}</dd>
            </div>
          </dl>
        </Card>

        <Card padding="md">
          <h2
            data-testid="user-trip-count"
            className="text-xl font-semibold text-ink mb-3"
          >
            Trips ({trips.length})
          </h2>
          {trips.length === 0 ? (
            <p className="text-ink-muted">This user has no trips.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-surface-subtle text-left">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold text-ink">Destination</th>
                    <th scope="col" className="px-3 py-2 font-semibold text-ink">Title</th>
                    <th scope="col" className="px-3 py-2 font-semibold text-ink">Dates</th>
                    <th scope="col" className="px-3 py-2 font-semibold text-ink">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip._id} className="border-t border-surface-border">
                      <td className="px-3 py-2 text-ink">{trip.destination}</td>
                      <td className="px-3 py-2 text-ink">{trip.title || '—'}</td>
                      <td className="px-3 py-2 text-ink">{formatDateRange(trip.startDate, trip.endDate)}</td>
                      <td className="px-3 py-2 text-ink">{formatBudget(trip.budget)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </PageContainer>
    </AppShell>
  );
};

export default AdminUserDetail;
