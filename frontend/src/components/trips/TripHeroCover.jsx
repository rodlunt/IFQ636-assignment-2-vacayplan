import { Link } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { tripCoverImage } from '../../utils/tripCoverImage';

const EDIT_LINK_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-surface/95 text-ink hover:bg-surface transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

const STATUS_LABEL = {
  active: 'Active',
  upcoming: 'Upcoming',
  planning: 'Planning',
  completed: 'Completed',
};

const STATUS_TONE = {
  active: 'success',
  planning: 'warning',
  completed: 'neutral',
};

const formatDateRange = (start, end) => {
  if (!start || !end) return '';
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${new Date(start).toLocaleDateString('en-AU', opts)} – ${new Date(end).toLocaleDateString('en-AU', opts)}`;
};

const TripHeroCover = ({ trip, onDelete }) => {
  const status = (trip.status || 'planning').toLowerCase();
  const statusLabel = STATUS_LABEL[status] || status;
  const statusTone = STATUS_TONE[status] || 'neutral';
  const coverSrc = trip.coverPhoto || tripCoverImage(trip.destination);

  return (
    <section className="relative rounded-2xl overflow-hidden mb-6 bg-brand-dark h-[200px] md:h-[280px]">
      <img
        src={coverSrc}
        alt={trip.destination}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
        aria-hidden="true"
      />
      <div className="relative flex flex-col justify-between p-5 md:p-8 h-full text-ink-inverse">
        <div className="flex justify-end">
          <Badge tone={statusTone} variant="solid" className="shadow-sm">
            {statusLabel}
          </Badge>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold drop-shadow-sm">
              {trip.destination}
            </h1>
            {trip.title ? (
              <p className="text-sm md:text-base text-white/80 mt-1">{trip.title}</p>
            ) : null}
            <p className="text-sm text-white/80 mt-1">
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`/trips/${trip._id}/edit`} className={EDIT_LINK_CLASSES} aria-label="Edit">
              <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
            <Button
              variant="destructive"
              size="md"
              leftIcon={TrashIcon}
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TripHeroCover;
