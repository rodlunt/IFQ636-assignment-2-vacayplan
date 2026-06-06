import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';

const DangerZoneCard = ({
  title = 'Danger Zone',
  body = 'Deleting this trip permanently removes all itinerary data, budget data, and bookmarks.',
  actionLabel = 'Delete this trip',
  onAction,
  className = '',
}) => {
  const composed = [
    'rounded-xl border-2 border-danger/40 bg-danger-bg/30 p-5 flex flex-col gap-3',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section aria-label={title} className={composed}>
      <div className="flex items-center gap-2">
        <ExclamationTriangleIcon className="h-5 w-5 text-danger" aria-hidden="true" />
        <h2 className="text-base font-semibold text-danger">{title}</h2>
      </div>
      <p className="text-sm text-ink">{body}</p>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-danger px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger hover:text-ink-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2"
      >
        <TrashIcon className="h-4 w-4" aria-hidden="true" />
        {actionLabel}
      </button>
    </section>
  );
};

export default DangerZoneCard;
