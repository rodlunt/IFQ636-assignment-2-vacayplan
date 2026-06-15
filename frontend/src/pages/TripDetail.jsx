import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import AppShell from '../components/layout/AppShell';
import PageContainer from '../components/layout/PageContainer';
import Breadcrumb from '../components/ui/Breadcrumb';
import AlertCallout from '../components/ui/AlertCallout';
import Tabs from '../components/ui/Tabs';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Card from '../components/ui/Card';
import AddActivityForm from '../components/AddActivityForm';
import ItineraryByDay from '../components/ItineraryByDay';
import TripHeroCover from '../components/trips/TripHeroCover';
import TripStatsRow from '../components/trips/TripStatsRow';
import TripInfo from '../components/trips/TripInfo';
import BudgetTracker from '../components/trips/BudgetTracker';
import WeatherForecast from '../components/trips/WeatherForecast';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState('');

  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true);
    setActivitiesError('');
    try {
      const response = await axiosInstance.get(`/api/trips/${id}/activities`);
      setActivities(response.data);
    } catch (err) {
      setActivitiesError(err.response?.data?.message || 'Failed to load activities.');
    } finally {
      setActivitiesLoading(false);
    }
  }, [id]);

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

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await axiosInstance.get(`/api/trips/${id}`);
        setTrip(response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Trip not found.');
        } else {
          setError(err.response?.data?.message || 'Failed to load trip.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  useEffect(() => {
    if (trip) fetchActivities();
  }, [trip, fetchActivities]);

  if (loading) {
    return (
      <AppShell>
        <PageContainer variant="wide">
          <p className="text-ink-muted">Loading trip…</p>
        </PageContainer>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <PageContainer variant="wide">
          <div className="flex flex-col gap-3">
            <AlertCallout tone="danger" className="self-start">{error}</AlertCallout>
            <Link to="/dashboard" className="text-brand hover:underline">
              ← Back to dashboard
            </Link>
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  if (!trip) return null;

  const overviewPanel = (
    <div className="flex flex-col gap-4">
      {trip.notes ? (
        <Card padding="md">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted mb-2">Notes</h3>
          <p className="text-sm text-ink whitespace-pre-wrap">{trip.notes}</p>
        </Card>
      ) : (
        <p className="text-sm text-ink-muted">No additional notes for this trip.</p>
      )}
    </div>
  );

  const itineraryPanel = (
    <div className="flex flex-col gap-4">
      {activitiesLoading ? <p className="text-ink-muted">Loading activities…</p> : null}
      {activitiesError ? (
        <AlertCallout tone="danger" className="self-start">{activitiesError}</AlertCallout>
      ) : null}
      {!activitiesLoading && !activitiesError && activities.length === 0 ? (
        <p className="text-sm text-ink-muted italic">No activities yet. Add your first one below.</p>
      ) : null}
      <ItineraryByDay
        activities={activities}
        tripId={trip._id}
        onActivityChanged={fetchActivities}
      />
      <AddActivityForm
        tripId={trip._id}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
        onActivityAdded={fetchActivities}
      />
    </div>
  );

  const budgetPanel = (
    <Card padding="md">
      <p className="text-sm text-ink-muted">
        Detailed expense tracking will be added in a future iteration. See the Budget Tracker on the right for the top-line aggregate.
      </p>
    </Card>
  );

  const tabsItems = [
    { label: 'Overview', content: overviewPanel },
    { label: 'Itinerary', content: itineraryPanel },
    { label: 'Budget', content: budgetPanel },
  ];

  return (
    <AppShell>
      <PageContainer variant="wide">
        <Breadcrumb
          className="mb-4"
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'My Trips', to: '/dashboard' },
            { label: trip.destination },
          ]}
        />

        <TripHeroCover trip={trip} onDelete={() => setShowDeleteConfirm(true)} />

        <TripStatsRow trip={trip} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-ink mb-3" id="activities-heading">
              Activities
            </h2>
            <Tabs items={tabsItems} />
          </section>
          <aside className="lg:col-span-1 flex flex-col gap-4">
            <BudgetTracker trip={trip} />
            <WeatherForecast trip={trip} />
            <TripInfo trip={trip} />
          </aside>
        </div>

        <p className="mt-6 text-sm">
          <Link to="/dashboard" className="text-brand hover:underline">
            ← Back to dashboard
          </Link>
        </p>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete this trip?"
          body="All activities will also be removed."
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

export default TripDetail;
