import Card from '../ui/Card';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const daysBetween = (a, b) =>
  Math.max(0, Math.round((new Date(b) - new Date(a)) / MS_PER_DAY));

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(amount);

export const deriveTripStats = (trip, now = new Date()) => {
  if (!trip) return { daysUntil: '—', nights: '—', spentPercent: '—', budgetDisplay: '—' };
  const start = trip.startDate ? new Date(trip.startDate) : null;
  const end = trip.endDate ? new Date(trip.endDate) : null;
  const daysUntilNum = start ? Math.ceil((start - now) / MS_PER_DAY) : null;
  const daysUntil =
    daysUntilNum == null
      ? '—'
      : daysUntilNum > 0
      ? `${daysUntilNum}`
      : daysUntilNum < 0
      ? '0'
      : '0';
  const nights = start && end ? daysBetween(start, end) : '—';
  const budgetDisplay = typeof trip.budget === 'number' ? formatCurrency(trip.budget) : '—';
  return { daysUntil, nights, spentPercent: '0%', budgetDisplay };
};

const Tile = ({ label, value }) => (
  <Card padding="sm" className="flex flex-col">
    <span className="text-xs uppercase tracking-wide text-ink-muted">{label}</span>
    <span className="text-xl font-semibold text-ink mt-1">{value}</span>
  </Card>
);

const TripStatsRow = ({ trip, now }) => {
  const stats = deriveTripStats(trip, now);
  return (
    <section
      aria-label="Trip stats"
      className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6"
    >
      <Tile label="Days Until" value={stats.daysUntil} />
      <Tile label="Nights" value={stats.nights} />
      <Tile label="Spent %" value={stats.spentPercent} />
      <Tile label="Budget" value={stats.budgetDisplay} />
    </section>
  );
};

export default TripStatsRow;
