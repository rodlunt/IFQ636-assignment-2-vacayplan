import { useState, useEffect, useRef } from 'react';
import { Disclosure } from '@headlessui/react';
import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../axiosConfig';
import Card from '../ui/Card';

const formatDay = (isoDate) =>
  new Date(isoDate).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

const formatTemp = (value) =>
  typeof value === 'number' ? `${Math.round(value)}°` : '—';

const WeatherForecast = ({ trip }) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasFetched, setHasFetched] = useState(false);
  // Free text the user typed into the location field to search a different place
  // than the trip's stored destination.
  const [query, setQuery] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const cancelEditRef = useRef(false);

  // Only fetch once the card has been opened, so a collapsed forecast
  // doesn't trigger an unnecessary weather API call.
  useEffect(() => {
    if (!hasFetched) return;
    let active = true;
    const fetchWeather = async () => {
      setLoading(true);
      setError('');
      try {
        let url = `/api/trips/${trip._id}/weather`;
        if (query) {
          url += `?q=${encodeURIComponent(query)}`;
        }
        const response = await axiosInstance.get(url);
        if (active) setForecast(response.data);
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Weather is unavailable right now.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchWeather();
    return () => {
      active = false;
    };
  }, [trip._id, hasFetched, query]);

  const days = forecast?.daily ?? [];

  const startEdit = () => {
    setDraft(forecast?.location ?? '');
    setEditing(true);
  };

  const cancelEdit = () => {
    cancelEditRef.current = true;
    setEditing(false);
  };

  // Commit the typed place as a new free-text search, which re-geocodes and
  // fetches a fresh forecast for it.
  const commitEdit = () => {
    setEditing(false);
    if (cancelEditRef.current) {
      cancelEditRef.current = false;
      return;
    }
    const next = draft.trim();
    if (!next || next === (forecast?.location ?? '')) return;
    setQuery(next);
  };

  return (
    <Card padding="md">
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button
              onClick={() => setHasFetched(true)}
              className="flex w-full items-center justify-between gap-3"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
                Weather Forecast
              </h2>
              <ChevronDownIcon
                className={`h-5 w-5 text-ink-muted transition-transform ${
                  open ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </Disclosure.Button>
            <Disclosure.Panel className="flex flex-col gap-3 pt-3">
              {editing ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    commitEdit();
                  }}
                >
                  <input
                    autoFocus
                    type="text"
                    value={draft}
                    placeholder="Search a place…"
                    aria-label="Search a different place for the forecast"
                    onChange={(event) => setDraft(event.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') cancelEdit();
                    }}
                    className="w-full rounded border border-surface-border bg-surface px-2 py-1 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </form>
              ) : forecast?.location ? (
                <button
                  type="button"
                  onClick={startEdit}
                  title="Click to search a different place"
                  className="self-start text-xs text-ink-muted underline decoration-dotted underline-offset-2 hover:text-accent"
                >
                  {forecast.location}
                </button>
              ) : null}
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-ink-muted">
                  <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Loading forecast…</span>
                </div>
              ) : null}
              {!loading && error ? (
                <p className="text-sm text-ink-muted italic">{error}</p>
              ) : null}
              {!loading && !error && days.length === 0 ? (
                <p className="text-sm text-ink-subtle italic">
                  No forecast available for these dates yet — weather is only forecast about two weeks ahead.
                </p>
              ) : null}
              {!loading && days.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {days.map((day) => (
                    <li key={day.date} className="flex items-center justify-between gap-3">
                      <span className="w-24 text-xs text-ink-muted">{formatDay(day.date)}</span>
                      <span className="flex-1 text-sm text-ink">{day.summary}</span>
                      <span className="whitespace-nowrap text-sm text-ink">
                        {formatTemp(day.tempMaxC)} / {formatTemp(day.tempMinC)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </Card>
  );
};

export default WeatherForecast;
