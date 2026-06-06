import Card from '../ui/Card';

const formatBudget = (amount) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(amount);

const BudgetTracker = ({ trip }) => {
  const total = typeof trip.budget === 'number' ? trip.budget : 0;
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
        Budget Tracker
      </h2>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-ink-muted">Total budget</span>
        <span className="text-lg font-semibold text-ink">{formatBudget(total)}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-ink-muted">Spent (placeholder)</span>
        <span className="text-sm text-ink">{formatBudget(0)}</span>
      </div>
      <p className="text-xs text-ink-subtle italic">
        Detailed expense tracking will be added in a future iteration.
      </p>
    </Card>
  );
};

export default BudgetTracker;
