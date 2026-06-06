import { Link } from 'react-router-dom';

const greetingFor = (hour) => {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const formatToday = (date) =>
  date.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const LINK_BUTTON_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-brand text-ink-inverse hover:bg-brand-hover transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

const GreetingBlock = ({ userName, now = new Date() }) => {
  const greeting = greetingFor(now.getHours());
  const friendlyDate = formatToday(now);
  const displayName = userName ? `, ${userName}` : '';

  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-ink">
          {greeting}
          {displayName}
        </h1>
        <p className="text-sm text-ink-muted mt-1">{friendlyDate}</p>
      </div>
      <Link to="/trips/new" className={`${LINK_BUTTON_CLASSES} self-start md:self-auto`}>
        + Add Trip
      </Link>
    </div>
  );
};

export default GreetingBlock;
