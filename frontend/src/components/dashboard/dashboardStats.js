const MS_PER_DAY = 1000 * 60 * 60 * 24;

const extractCountry = (destination) => {
  if (!destination) return null;
  const parts = destination.split(',').map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || null;
};

const formatBudget = (amount) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(amount);

export const deriveDashboardStats = (trips = [], now = new Date()) => {
  const totalTrips = trips.length;

  const upcomingTrips = trips
    .map((t) => ({ trip: t, start: new Date(t.startDate) }))
    .filter(({ start }) => !Number.isNaN(start.getTime()) && start > now)
    .sort((a, b) => a.start - b.start);
  const daysUntil =
    upcomingTrips.length > 0
      ? Math.ceil((upcomingTrips[0].start - now) / MS_PER_DAY)
      : null;
  const nextDestination =
    upcomingTrips.length > 0 ? upcomingTrips[0].trip.destination || null : null;

  const activeCount = trips.filter((t) => t.status === 'active').length;
  const upcomingCount = upcomingTrips.length;

  const totalBudget = trips.reduce(
    (sum, t) => sum + (typeof t.budget === 'number' ? t.budget : 0),
    0
  );

  const countries = new Set(
    trips.map((t) => extractCountry(t.destination)).filter(Boolean)
  );

  return {
    totalTrips,
    activeCount,
    upcomingCount,
    daysUntil,
    daysUntilDisplay: daysUntil == null ? '—' : `${daysUntil}`,
    nextDestination,
    totalBudget,
    totalBudgetDisplay: totalTrips > 0 ? formatBudget(totalBudget) : '—',
    countries: countries.size,
  };
};
