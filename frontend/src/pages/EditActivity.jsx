import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import ErrorMessage from '../components/ErrorMessage';

const toDateInputValue = (iso) => (iso ? iso.slice(0, 10) : '');

const EditActivity = () => {
  const { tripId, activityId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    description: '',
    status: 'wishlist',
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [tripRes, activitiesRes] = await Promise.all([
          axiosInstance.get(`/api/trips/${tripId}`),
          axiosInstance.get(`/api/trips/${tripId}/activities`),
        ]);
        const activity = activitiesRes.data.find((a) => a._id === activityId);
        if (!activity) {
          setLoadError('Activity not found.');
          return;
        }
        setTrip(tripRes.data);
        setFormData({
          date: toDateInputValue(activity.date),
          time: activity.time || '',
          location: activity.location || '',
          description: activity.description || '',
          status: activity.status || 'wishlist',
        });
      } catch (err) {
        if (err.response?.status === 404) {
          setLoadError('Trip or activity not found.');
        } else {
          setLoadError(err.response?.data?.message || 'Failed to load activity.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tripId, activityId]);

  const validate = () => {
    if (!formData.location.trim()) return 'Location is required.';
    if (!formData.date) return 'Date is required.';
    if (!formData.time) return 'Time is required.';
    const minDate = toDateInputValue(trip?.startDate);
    const maxDate = toDateInputValue(trip?.endDate);
    if (minDate && formData.date < minDate) {
      return 'Date must fall within the trip date range.';
    }
    if (maxDate && formData.date > maxDate) {
      return 'Date must fall within the trip date range.';
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
    setSubmitting(true);
    try {
      const payload = {
        date: formData.date,
        time: formData.time,
        location: formData.location.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
      };
      await axiosInstance.put(`/api/trips/${tripId}/activities/${activityId}`, payload);
      navigate(`/trips/${tripId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update activity.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-4">
        <p className="text-center text-gray-500">Loading activity…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-4">
        <ErrorMessage message={loadError} />
        <Link to={`/trips/${tripId}`} className="block mt-4 text-blue-600 underline">
          ← Back to trip
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <Link to={`/trips/${tripId}`} className="text-blue-600 underline">
        ← Back to trip
      </Link>
      <h1 className="text-3xl font-bold mt-4 mb-6">Edit activity</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700">Location *</span>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full mt-1 p-2 border rounded"
          />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Date *</span>
            <input
              type="date"
              value={formData.date}
              min={toDateInputValue(trip?.startDate)}
              max={toDateInputValue(trip?.endDate)}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full mt-1 p-2 border rounded"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Time *</span>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full mt-1 p-2 border rounded"
            />
          </label>
        </div>
        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700">Description (optional)</span>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full mt-1 p-2 border rounded"
          />
        </label>
        <fieldset className="mb-4">
          <legend className="text-sm font-medium text-gray-700 mb-1">Status</legend>
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="status"
                value="wishlist"
                checked={formData.status === 'wishlist'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
              <span>Wishlist</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="status"
                value="booked"
                checked={formData.status === 'booked'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
              <span>Booked</span>
            </label>
          </div>
        </fieldset>
        <ErrorMessage message={error} />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-brand text-ink-inverse p-2 rounded hover:bg-brand-hover disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/trips/${tripId}`)}
            disabled={submitting}
            className="flex-1 bg-gray-200 text-gray-800 p-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditActivity;
