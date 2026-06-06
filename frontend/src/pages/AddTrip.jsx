import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import AppShell from '../components/layout/AppShell';
import PageContainer from '../components/layout/PageContainer';
import Breadcrumb from '../components/ui/Breadcrumb';
import Card from '../components/ui/Card';
import FormField from '../components/ui/FormField';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import AlertCallout from '../components/ui/AlertCallout';
import FileUploadZone from '../components/ui/FileUploadZone';

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'active', label: 'Active' },
];

const EMPTY_VALUES = {
  destination: '',
  startDate: '',
  endDate: '',
  budget: '',
  status: 'planning',
  notes: '',
};

const validate = (values) => {
  if (!values.destination.trim()) return 'Destination is required.';
  if (!values.startDate) return 'Start date is required.';
  if (!values.endDate) return 'End date is required.';
  if (values.endDate < values.startDate) {
    return 'End date must be on or after start date.';
  }
  if (values.budget !== '' && Number(values.budget) < 0) {
    return 'Budget cannot be negative.';
  }
  return '';
};

const buildPayload = (values) => ({
  destination: values.destination.trim(),
  startDate: values.startDate,
  endDate: values.endDate,
  budget: values.budget === '' ? null : Number(values.budget),
  notes: values.notes.trim() || null,
});

const AddTrip = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [coverFile, setCoverFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (event) =>
    setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError('');
    setApiError('');
    const err = validate(values);
    if (err) {
      setValidationError(err);
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.post('/api/trips', buildPayload(values));
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create trip.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = validationError || apiError;
  const submitText = submitting ? 'Creating…' : 'Create Trip';

  return (
    <AppShell>
      <PageContainer variant="narrow">
        <Breadcrumb
          className="mb-2"
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'My Trips', to: '/dashboard' },
            { label: 'Add New Trip' },
          ]}
        />
        <h1 className="text-3xl font-bold text-ink">Add New Trip</h1>
        <p className="text-ink-muted mt-1 mb-6">Plan your next adventure</p>

        <Card padding="md">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-ink">Trip details</h2>
            <p className="text-sm text-ink-muted mt-1">
              Fill in the details below to start planning your trip.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <FormField label="Destination" required>
              <Input
                type="text"
                value={values.destination}
                onChange={updateField('destination')}
                placeholder="Where are you going?"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Start date" required>
                <Input
                  type="date"
                  value={values.startDate}
                  onChange={updateField('startDate')}
                />
              </FormField>
              <FormField label="End date" required>
                <Input
                  type="date"
                  value={values.endDate}
                  onChange={updateField('endDate')}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Budget (AUD)">
                <Input
                  type="number"
                  min="0"
                  value={values.budget}
                  onChange={updateField('budget')}
                  placeholder="0"
                />
              </FormField>
              <FormField label="Status">
                <select
                  id="trip-status"
                  value={values.status}
                  onChange={updateField('status')}
                  className="block w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Notes">
              <Textarea
                rows={4}
                value={values.notes}
                onChange={updateField('notes')}
                placeholder="Itinerary ideas, accommodation links, things to do..."
              />
            </FormField>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">Cover Photo</span>
              <FileUploadZone value={coverFile} onChange={setCoverFile} />
            </div>

            {displayError ? (
              <AlertCallout tone="danger" className="self-start">
                {displayError}
              </AlertCallout>
            ) : null}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={submitting}
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitText}
              </Button>
            </div>
          </form>
        </Card>
      </PageContainer>
    </AppShell>
  );
};

export default AddTrip;
