import { useEffect, useState } from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../axiosConfig';
import AlertCallout from '../ui/AlertCallout';
import AdminTripCard from './AdminTripCard';

const usePropOrFetch = (tripsProp) => {
  const [trips, setTrips] = useState(tripsProp || []);
  const [loading, setLoading] = useState(tripsProp == null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tripsProp != null) {
      setTrips(tripsProp);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchTrips = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/trips');
        if (!cancelled) setTrips(response.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load trips.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTrips();
    return () => {
      cancelled = true;
    };
  }, [tripsProp]);

  return { trips, loading, error };
};

const AdminTripsSection = ({ trips: tripsProp }) => {
  const { trips, loading, error } = usePropOrFetch(tripsProp);

  return (
    <section aria-label="All trips" className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDaysIcon className="h-5 w-5 text-brand" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-ink">All Trips</h2>
      </div>
      {loading ? (
        <p className="text-sm text-ink-muted">Loading trips…</p>
      ) : error ? (
        <AlertCallout tone="danger" className="self-start">{error}</AlertCallout>
      ) : trips.length === 0 ? (
        <p className="text-sm text-ink-muted">No trips in the system yet.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {trips.map((trip) => (
            <AdminTripCard key={trip._id} trip={trip} />
          ))}
        </div>
      )}
    </section>
  );
};

export default AdminTripsSection;
