import { Link } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { tripCoverImage } from '../../utils/tripCoverImage';

const STATUS_LABEL = {
  active: 'Active',
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
  const opts = { month: 'short', day: 'numeric' };
  const startStr = new Date(start).toLocaleDateString('en-AU', opts);
  const endStr = new Date(end).toLocaleDateString('en-AU', { ...opts, year: 'numeric' });
  return `${startStr} – ${endStr}`;
};

const formatBudget = (amount) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const CoverImage = ({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    className="w-full h-full object-cover"
    loading="lazy"
  />
);

const TripCard = ({ trip, onEdit, onDelete }) => {
  const status = (trip.status || 'planning').toLowerCase();
  const statusTone = STATUS_TONE[status] || 'neutral';
  const statusLabel = STATUS_LABEL[status] || status;

  return (
    <li className="group">
      <article className="bg-surface border border-surface-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        <Link
          to={`/trips/${trip._id}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <div className="flex md:flex-col">
            <div className="relative h-24 w-32 md:h-40 md:w-full shrink-0">
              <CoverImage
                src={trip.coverPhoto || tripCoverImage(trip.destination)}
                alt={trip.destination || ''}
              />
              <div className="absolute top-2 right-2">
                <Badge tone={statusTone} variant="solid">
                  {statusLabel}
                </Badge>
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-1 min-w-0">
              <h2 className="text-base md:text-lg font-semibold text-ink truncate">
                {trip.destination}
              </h2>
              {trip.title ? (
                <p className="text-xs text-ink-muted truncate">{trip.title}</p>
              ) : null}
              <p className="text-xs text-ink-muted mt-1">
                {formatDateRange(trip.startDate, trip.endDate)}
              </p>
              <p className="text-sm text-ink mt-1">Budget: {formatBudget(trip.budget)}</p>
            </div>
          </div>
        </Link>
        {(onEdit || onDelete) ? (
          <div className="flex justify-end gap-2 px-4 pb-3 -mt-1">
            {onEdit ? (
              <Button
                variant="ghost-brand"
                size="sm"
                leftIcon={PencilSquareIcon}
                onClick={() => onEdit(trip)}
                aria-label={`Edit ${trip.destination}`}
              >
                Edit
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                variant="destructive-soft"
                size="sm"
                leftIcon={TrashIcon}
                onClick={() => onDelete(trip)}
                aria-label={`Delete ${trip.destination}`}
              >
                Delete
              </Button>
            ) : null}
          </div>
        ) : null}
      </article>
    </li>
  );
};

export default TripCard;
