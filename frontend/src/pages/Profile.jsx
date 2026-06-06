import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ShieldCheckIcon as ShieldIconSolid,
} from '@heroicons/react/24/solid';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import PageContainer from '../components/layout/PageContainer';
import AlertCallout from '../components/ui/AlertCallout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Input from '../components/ui/Input';

const buildSidebarItems = (isAdmin) => {
  const items = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },
  ];
  if (isAdmin) {
    items.push({
      label: 'Admin',
      to: '/admin/users',
      icon: ShieldCheckIcon,
      iconSolid: ShieldIconSolid,
    });
  }
  return items;
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarItems = buildSidebarItems(user?.isAdmin);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setName(response.data.name || '');
        setEmail(response.data.email || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      await axiosInstance.put(
        '/api/auth/profile',
        { name, email },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSuccessMessage('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell items={sidebarItems}>
      <PageContainer variant="narrow">
        <h1 className="text-3xl font-bold text-ink mb-6">Account</h1>

        {error ? (
          <div className="mb-4">
            <AlertCallout tone="danger">{error}</AlertCallout>
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-4">
            <AlertCallout tone="success">{successMessage}</AlertCallout>
          </div>
        ) : null}

        <Card>
          {loading ? (
            <p className="text-ink-muted">Loading profile…</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField label="Name">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </FormField>
              <FormField
                label="Email"
                helper="Email is managed by your account and cannot be changed here."
              >
                <Input
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  autoComplete="email"
                />
              </FormField>
              <div className="flex justify-end">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Updating…' : 'Update Profile'}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <section aria-label="Sign out" className="mt-6">
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Sign out</h2>
                <p className="text-sm text-ink-muted">
                  Sign out of this account on this device.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </div>
          </Card>
        </section>
      </PageContainer>
    </AppShell>
  );
};

export default Profile;
