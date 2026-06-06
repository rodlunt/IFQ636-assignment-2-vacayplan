import Card from '../ui/Card';

const StatsCard = ({ label, value, icon: Icon, subtext }) => (
  <Card padding="sm" className="flex items-center gap-3">
    {Icon ? (
      <div className="rounded-full bg-brand/10 text-brand p-2">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
    ) : null}
    <div className="flex flex-col min-w-0">
      <span className="text-xs uppercase tracking-wide text-ink-muted">{label}</span>
      <span className="text-xl font-semibold text-ink">{value}</span>
      {subtext ? (
        <span className="text-sm text-ink-muted truncate" title={subtext}>
          {subtext}
        </span>
      ) : null}
    </div>
  </Card>
);

export default StatsCard;
