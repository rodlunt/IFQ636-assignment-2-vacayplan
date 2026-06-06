import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import ErrorMessage from './ErrorMessage';
import ConfirmDialog from './ui/ConfirmDialog';

const formatDayHeading = (iso) =>
  new Date(iso).toLocaleDateString('en-AU', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const groupActivitiesByDate = (activities) => {
  const groups = new Map();
  for (const activity of activities) {
    const key = activity.date.slice(0, 10);
    if (!groups.has(key)) {
      groups.set(key, { dateKey: key, dateISO: activity.date, items: [] });
    }
    groups.get(key).items.push(activity);
  }
  return Array.from(groups.values()).sort((a, b) =>
    a.dateKey.localeCompare(b.dateKey),
  );
};

const ItineraryByDay = ({ activities, tripId, onActivityChanged }) => {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [toggleErrorId, setToggleErrorId] = useState(null);
  const [toggleError, setToggleError] = useState('');

  if (!activities || activities.length === 0) return null;

  const groups = groupActivitiesByDate(activities);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleteError('');
    setDeleting(true);
    try {
      await axiosInstance.delete(
        `/api/trips/${tripId}/activities/${pendingDelete._id}`,
      );
      setPendingDelete(null);
      onActivityChanged?.();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete activity.');
    } finally {
      setDeleting(false);
    }
  };

  const closeConfirm = () => {
    if (deleting) return;
    setPendingDelete(null);
    setDeleteError('');
  };

  const handleStatusToggle = async (activity) => {
    const nextStatus = activity.status === 'booked' ? 'wishlist' : 'booked';
    setTogglingId(activity._id);
    setToggleError('');
    setToggleErrorId(null);
    try {
      await axiosInstance.patch(
        `/api/trips/${tripId}/activities/${activity._id}/status`,
        { status: nextStatus },
      );
      onActivityChanged?.();
    } catch (err) {
      setToggleError(err.response?.data?.message || 'Failed to update status.');
      setToggleErrorId(activity._id);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6 mb-4">
      {groups.map((group) => (
        <section key={group.dateKey} aria-labelledby={`day-${group.dateKey}`}>
          <h3
            id={`day-${group.dateKey}`}
            className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3"
          >
            {formatDayHeading(group.dateISO)}
          </h3>
          <ul className="space-y-3">
            {group.items.map((activity) => (
              <li
                key={activity._id}
                className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded-r"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium">{activity.location}</p>
                  <p className="text-sm text-gray-600">{activity.time}</p>
                </div>
                {activity.description && (
                  <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
                )}
                <div className="flex items-center justify-between mt-1">
                  {tripId ? (
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(activity)}
                      disabled={togglingId === activity._id}
                      aria-label={
                        activity.status === 'booked'
                          ? `Mark ${activity.location} as wishlist`
                          : `Mark ${activity.location} as booked`
                      }
                      className={`text-xs px-2 py-0.5 rounded border ${
                        activity.status === 'booked'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      } disabled:opacity-60`}
                    >
                      {togglingId === activity._id
                        ? 'Updating…'
                        : activity.status === 'booked'
                          ? '✓ Booked'
                          : 'Wishlist'}
                    </button>
                  ) : (
                    <p className="text-xs text-gray-500 capitalize">{activity.status}</p>
                  )}
                  <div className="flex items-center gap-3">
                    {tripId && (
                      <Link
                        to={`/trips/${tripId}/activities/${activity._id}/edit`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                    {tripId && (
                      <button
                        type="button"
                        onClick={() => setPendingDelete(activity)}
                        className="text-xs text-red-600 hover:underline"
                        aria-label={`Delete ${activity.location}`}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                {toggleErrorId === activity._id && (
                  <div className="mt-2">
                    <ErrorMessage message={toggleError} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete this activity?"
        body={
          pendingDelete
            ? `"${pendingDelete.location}" will be removed from the itinerary.`
            : ''
        }
        confirmLabel="Delete"
        loadingLabel="Deleting…"
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default ItineraryByDay;
