import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/layout/AuthShell';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import AuthTabSwitcher from '../components/auth/AuthTabSwitcher';
import FormField from '../components/ui/FormField';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AlertCallout from '../components/ui/AlertCallout';
import TextLink from '../components/ui/TextLink';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    if (!formData.name || !formData.email || !formData.password) {
      return 'All fields are required.';
    }
    if (!EMAIL_REGEX.test(formData.email)) {
      return 'Enter a valid email address.';
    }
    if (formData.password.length < PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };
      const response = await axiosInstance.post('/api/auth/register', payload);
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <AuthShell brandPanel={<AuthBrandPanel />}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-3xl font-bold text-ink">Create your account</h1>
          <p className="text-sm text-ink-muted">
            Start planning your next adventure
          </p>
        </header>

        <AuthTabSwitcher activeTab="register" />

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
          aria-label="register"
        >
          <FormField label="Name" required>
            <Input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FormField>

          <FormField label="Email" required>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormField>

          <FormField label="Password" required>
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </FormField>

          <FormField label="Confirm password" required>
            <Input
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </FormField>

          {error ? (
            <AlertCallout tone="danger" className="self-start">
              {error}
            </AlertCallout>
          ) : null}

          <Button type="submit" variant="primary" className="w-full">
            Register
          </Button>
        </form>

        <p className="text-sm text-ink-muted text-center">
          Already have an account?{' '}
          <TextLink to="/login">Sign in</TextLink>
        </p>

        <p className="text-mini text-ink-subtle text-center">
          By signing in you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </AuthShell>
  );
};

export default Register;
