import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import AuthShell from '../components/layout/AuthShell';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import AuthTabSwitcher from '../components/auth/AuthTabSwitcher';
import FormField from '../components/ui/FormField';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AlertCallout from '../components/ui/AlertCallout';
import TextLink from '../components/ui/TextLink';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    // Recovery flow not yet wired to backend (tracked separately).
    // eslint-disable-next-line no-alert
    window.alert('Password recovery is not yet available. Contact support to reset your password.');
  };

  return (
    <AuthShell brandPanel={<AuthBrandPanel />}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-3xl font-bold text-ink">Welcome back</h1>
          <p className="text-sm text-ink-muted">
            Sign in to your VacayPlan account
          </p>
        </header>

        <AuthTabSwitcher activeTab="signin" />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          aria-label="login"
        >
          <FormField label="Email" required>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormField>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium text-ink">
                Password
                <span className="text-danger ml-0.5" aria-hidden="true">*</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-mini font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-sm"
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="login-password"
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error ? (
            <AlertCallout tone="danger" className="self-start">
              {error}
            </AlertCallout>
          ) : null}

          <Button type="submit" variant="primary" className="w-full">
            Login
          </Button>
        </form>

        <p className="text-sm text-ink-muted text-center">
          Don&apos;t have an account?{' '}
          <TextLink to="/register">Create one free</TextLink>
        </p>

        <p className="text-mini text-ink-subtle text-center">
          By signing in you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </AuthShell>
  );
};

export default Login;
