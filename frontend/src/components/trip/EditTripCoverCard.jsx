import { CameraIcon } from '@heroicons/react/24/outline';
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
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${new Date(start).toLocaleDateString('en-AU', opts)} – ${new Date(end).toLocaleDateString('en-AU', opts)}`;
};

const EditTripCoverCard = ({ destination, startDate, endDate, status = 'planning' }) => {
  const statusKey = (status || 'planning').toLowerCase();
  const statusTone = STATUS_TONE[statusKey] || 'neutral';
  const statusLabel = STATUS_LABEL[statusKey] || statusKey;
  const coverSrc = tripCoverImage(destination);

  return (
    <section
      aria-label="Trip cover"
      className="bg-surface border border-surface-border rounded-xl overflow-hidden"
    >
      <div className="relative aspect-[16/10] w-full bg-surface-subtle">
        <img
          src={coverSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <Badge tone={statusTone} variant="solid">
            {statusLabel}
          </Badge>
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            {destination || 'Untitled trip'}
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            {formatDateRange(startDate, endDate) || 'Dates to be confirmed'}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={CameraIcon}
          className="self-start"
          aria-label="Change photo"
          disabled
          title="Photo selection coming soon"
        >
          Change photo
        </Button>
      </div>
    </section>
  );
};

export default EditTripCoverCard;
