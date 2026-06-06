import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  GlobeAsiaAustraliaIcon,
} from '@heroicons/react/24/outline';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import PageContainer from '../components/layout/PageContainer';
import AlertCallout from '../components/ui/AlertCallout';
import GreetingBlock from '../components/dashboard/GreetingBlock';
import StatsCard from '../components/dashboard/StatsCard';
import UpcomingDeparturesCard from '../components/dashboard/UpcomingDeparturesCard';
import { deriveDashboardStats } from '../components/dashboard/dashboardStats';
import TripCard from '../components/trips/TripCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('deleted') === '1') {
      setSuccessMessage('Trip deleted.');
      searchParams.delete('deleted');
      setSearchParams(searchParams, { replace: true });
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axiosInstance.get('/api/trips');
        setTrips(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load trips.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const stats = deriveDashboardStats(trips);

  const totalTripsSubtext = (() => {
    const segments = [];
    if (stats.activeCount > 0) segments.push(`${stats.activeCount} active`);
    if (stats.upcomingCount > 0) segments.push(`${stats.upcomingCount} upcoming`);
    return segments.length > 0 ? segments.join(' · ') : 'No trips yet';
  })();
  const daysUntilSubtext = stats.nextDestination || 'No upcoming trip';
  const totalBudgetSubtext = 'Across all trips';
  const countriesSubtext =
    stats.countries > 0
      ? `${stats.countries} unique ${stats.countries === 1 ? 'destination' : 'destinations'}`
      : 'Lifetime';

  return (
    <AppShell>
      <PageContainer variant="wide">
        <GreetingBlock userName={user?.name} />

        {successMessage ? (
          <div className="mb-4">
            <AlertCallout tone="success">{successMessage}</AlertCallout>
          </div>
        ) : null}

        {error ? (
          <div className="mb-4">
            <AlertCallout tone="danger">{error}</AlertCallout>
          </div>
        ) : null}

        <section
          aria-label="Trip stats"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          <StatsCard
            label="Total Trips"
            value={stats.totalTrips}
            icon={ClipboardDocumentListIcon}
            subtext={totalTripsSubtext}
          />
          <StatsCard
            label="Days Until"
            value={stats.daysUntilDisplay}
            icon={CalendarDaysIcon}
            subtext={daysUntilSubtext}
          />
          <StatsCard
            label="Total Budgeted"
            value={stats.totalBudgetDisplay}
            icon={BanknotesIcon}
            subtext={totalBudgetSubtext}
          />
          <StatsCard
            label="Countries"
            value={stats.countries}
            icon={GlobeAsiaAustraliaIcon}
            subtext={countriesSubtext}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-ink mb-3">My Trips</h2>
            {loading ? (
              <p className="text-ink-muted">Loading trips…</p>
            ) : trips.length === 0 ? (
              <p className="text-ink-muted">No trips yet. Start planning your first vacation.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {trips.map((trip) => (
                  <TripCard key={trip._id} trip={trip} />
                ))}
              </ul>
            )}
          </section>

          <aside className="lg:col-span-1">
            <UpcomingDeparturesCard trips={trips} />
          </aside>
        </div>
      </PageContainer>
    </AppShell>
  );
};

export default Dashboard;
