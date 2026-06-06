import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const DEFAULT_STATS = [
  { value: '12k+', label: 'Active travellers' },
  { value: '48k', label: 'Trips planned' },
  { value: '94%', label: 'Satisfaction rate' },
];

const AuthBrandPanel = ({
  headline,
  highlight = 'adventure',
  subCopy = 'Manage all your trips, bookings, and itineraries in one place. Built for travellers who move fast.',
  stats = DEFAULT_STATS,
}) => {
  const headlineParts = headline || ['Plan your next', 'with ease.'];

  return (
    <div className="relative flex h-full min-h-[24rem] flex-col justify-between gap-12 overflow-hidden bg-gradient-to-br from-brand-dark via-brand-dark to-brand p-8 text-ink-inverse md:min-h-screen md:p-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-brand-accent/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-brand/40 blur-3xl"
      />

      <div className="relative flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-accent text-brand-dark shadow-sm">
          <PaperAirplaneIcon className="h-5 w-5 -rotate-12" aria-hidden="true" />
        </span>
        <span className="text-xl font-bold tracking-tight">VacayPlan</span>
      </div>

      <div className="relative flex flex-col gap-5">
        <h2 className="text-3xl font-bold leading-tight md:text-5xl md:leading-tight">
          {headlineParts[0]}{' '}
          <span className="text-brand-accent">{highlight}</span>
          <br className="hidden md:block" />{' '}
          {headlineParts[1]}
        </h2>
        <p className="max-w-md text-base text-white/70 md:text-lg">{subCopy}</p>
      </div>

      <dl className="relative grid grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <dt className="order-2 text-mini text-white/60 md:text-sm">
              {stat.label}
            </dt>
            <dd className="order-1 text-2xl font-bold text-ink-inverse md:text-3xl">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default AuthBrandPanel;
