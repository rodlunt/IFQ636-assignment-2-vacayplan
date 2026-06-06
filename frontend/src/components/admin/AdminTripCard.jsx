import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
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

const AdminTripCard = ({ trip }) => {
  const status = (trip.status || 'planning').toLowerCase();
  const statusTone = STATUS_TONE[status] || 'neutral';
  const statusLabel = STATUS_LABEL[status] || status;
  const owner = trip.userId || {};
  const ownerName = owner.name || owner.email || 'Unknown owner';
  const ownerHref = owner._id ? `/admin/users/${owner._id}` : null;

  return (
    <article className="flex-shrink-0 w-64 bg-surface border border-surface-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-32 w-full">
        <img
          src={trip.coverPhoto || tripCoverImage(trip.destination)}
          alt={trip.destination || ''}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <Badge tone={statusTone} variant="solid">
            {statusLabel}
          </Badge>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1 min-w-0">
        <h3 className="text-sm font-semibold text-ink truncate">
          {trip.destination}
        </h3>
        <p className="text-xs text-ink-muted">
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>
        <p className="text-xs text-ink">
          Budget: {formatBudget(trip.budget)}
        </p>
        {ownerHref ? (
          <Link
            to={ownerHref}
            className="text-xs text-brand hover:underline truncate"
          >
            {ownerName}
          </Link>
        ) : (
          <span className="text-xs text-ink-muted truncate">{ownerName}</span>
        )}
      </div>
    </article>
  );
};

export default AdminTripCard;
