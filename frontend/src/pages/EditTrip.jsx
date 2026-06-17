import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../axiosConfig';
import AppShell from '../components/layout/AppShell';
import PageContainer from '../components/layout/PageContainer';
import Breadcrumb from '../components/ui/Breadcrumb';
import AlertCallout from '../components/ui/AlertCallout';
import Card from '../components/ui/Card';
import FormField from '../components/ui/FormField';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EditTripCoverCard from '../components/trip/EditTripCoverCard';
import DangerZoneCard from '../components/ui/DangerZoneCard';

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
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

// status is included so the backend State pattern can validate the transition
// (planning -> active -> completed). Without it the dropdown change is silently
// dropped and the trip's status never updates.
const buildPayload = (values) => ({
  destination: values.destination.trim(),
  startDate: values.startDate,
  endDate: values.endDate,
  budget: values.budget === '' ? null : Number(values.budget),
  status: values.status,
  notes: values.notes.trim() || null,
});

const formatLastSaved = (iso) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('en-AU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState(EMPTY_VALUES);
  const [loadedStatus, setLoadedStatus] = useState('planning');
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [apiError, setApiError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await axiosInstance.get(`/api/trips/${id}`);
        const trip = response.data;
        setValues({
          destination: trip.destination || '',
          startDate: trip.startDate ? trip.startDate.slice(0, 10) : '',
          endDate: trip.endDate ? trip.endDate.slice(0, 10) : '',
          budget: trip.budget != null ? String(trip.budget) : '',
          status: (trip.status || 'planning').toLowerCase(),
          notes: trip.notes || '',
        });
        setLoadedStatus((trip.status || 'planning').toLowerCase());
        setLastSaved(trip.updatedAt || trip.createdAt || null);
      } catch (err) {
        if (err.response?.status === 404) {
          setLoadError('Trip not found.');
        } else {
          setLoadError(err.response?.data?.message || 'Failed to load trip.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

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
      await axiosInstance.put(`/api/trips/${id}`, buildPayload(values));
      navigate(`/trips/${id}`);
    } catch (err2) {
      setApiError(err2.response?.data?.message || 'Failed to update trip.');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setDeleting(true);
    try {
      await axiosInstance.delete(`/api/trips/${id}`);
      navigate('/dashboard?deleted=1');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete trip.');
      setDeleting(false);
    }
  };

  const displayError = validationError || apiError;
  const lastSavedText = formatLastSaved(lastSaved);

  if (loading) {
    return (
      <AppShell>
        <PageContainer variant="wide">
          <p className="text-ink-muted">Loading trip…</p>
        </PageContainer>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <PageContainer variant="wide">
          <div className="flex flex-col gap-3">
            <AlertCallout tone="danger" className="self-start">{loadError}</AlertCallout>
            <Link to="/dashboard" className="text-brand hover:underline">
              ← Back to dashboard
            </Link>
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageContainer variant="wide">
        <Breadcrumb
          className="mb-3"
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'My Trips', to: '/dashboard' },
            { label: values.destination || 'Trip' },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-6">
          <h1 className="text-3xl font-bold text-ink">Edit Trip</h1>
          {lastSavedText ? (
            <p className="text-sm text-ink-muted" aria-live="polite">
              Last saved {lastSavedText}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5 flex flex-col gap-6 order-1 md:order-1">
            <EditTripCoverCard
              destination={values.destination}
              startDate={values.startDate}
              endDate={values.endDate}
              status={loadedStatus}
            />
            <div className="hidden md:block">
              <DangerZoneCard onAction={() => setShowDeleteConfirm(true)} />
            </div>
          </div>

          <div className="md:col-span-7 order-2 md:order-2">
            <Card padding="md" className="flex flex-col gap-5">
              <header>
                <h2 className="text-xl font-semibold text-ink">Trip Details</h2>
                <p className="text-sm text-ink-muted mt-1">
                  Update the destination, dates, budget, and notes for this trip.
                </p>
              </header>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <FormField label="Destination" required>
                  <Input
                    type="text"
                    value={values.destination}
                    onChange={updateField('destination')}
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
                    />
                  </FormField>
                  <FormField label="Status">
                    <select
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
                    placeholder="Add any notes for this trip…"
                  />
                </FormField>

                {displayError ? (
                  <AlertCallout tone="danger" className="self-start">
                    {displayError}
                  </AlertCallout>
                ) : null}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-surface-border">
                  <span
                    className="inline-flex items-center gap-2 text-mini text-ink-muted"
                    aria-live="polite"
                  >
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    Click Save Changes to update
                  </span>
                  <div className="flex gap-3 sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={submitting}
                      onClick={() => navigate(`/trips/${id}`)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Saving…' : 'Save changes'}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>

          <div className="md:hidden order-3">
            <DangerZoneCard onAction={() => setShowDeleteConfirm(true)} />
          </div>
        </div>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete this trip?"
          body="All activities, budget data, and bookmarks for this trip will also be removed."
          confirmLabel="Delete"
          loadingLabel="Deleting…"
          cancelLabel="Cancel"
          destructive
          loading={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </PageContainer>
    </AppShell>
  );
};

export default EditTrip;
