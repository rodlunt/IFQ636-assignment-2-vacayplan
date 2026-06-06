import Card from '../ui/Card';

const formatDateRange = (start, end) => {
  if (!start || !end) return '';
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${new Date(start).toLocaleDateString('en-AU', opts)} – ${new Date(end).toLocaleDateString('en-AU', opts)}`;
};

const Row = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs uppercase tracking-wide text-ink-muted">{label}</span>
    <span className="text-sm text-ink mt-1">{value || '—'}</span>
  </div>
);

const TripInfo = ({ trip }) => (
  <Card padding="md" className="flex flex-col gap-4">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
      Trip Info
    </h2>
    <Row label="Dates" value={formatDateRange(trip.startDate, trip.endDate)} />
    {trip.notes ? (
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-ink-muted">Notes</span>
        <p className="text-sm text-ink mt-1 whitespace-pre-wrap">{trip.notes}</p>
      </div>
    ) : null}
  </Card>
);

export default TripInfo;
