import { Link } from 'react-router-dom';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import Card from '../ui/Card';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const pickUpcoming = (trips, now, limit = 3) =>
  trips
    .filter((t) => {
      const start = new Date(t.startDate);
      return !Number.isNaN(start.getTime()) && start > now;
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, limit);

const daysUntil = (startDate, now) =>
  Math.ceil((new Date(startDate) - now) / MS_PER_DAY);

const UpcomingDeparturesCard = ({ trips = [], now = new Date(), limit = 3 }) => {
  const upcoming = pickUpcoming(trips, now, limit);

  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <CalendarDaysIcon className="h-5 w-5 text-brand" aria-hidden="true" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
          Upcoming Departures
        </h2>
      </div>
      {upcoming.length === 0 ? (
        <p className="text-sm text-ink-muted">No upcoming trips scheduled.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-surface-border">
          {upcoming.map((trip) => (
            <li key={trip._id} className="py-2 first:pt-0 last:pb-0">
              <Link
                to={`/trips/${trip._id}`}
                className="flex items-center justify-between gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <span className="text-sm text-ink truncate">{trip.destination}</span>
                <span className="text-xs text-ink-muted shrink-0">
                  {daysUntil(trip.startDate, now)} days
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default UpcomingDeparturesCard;
