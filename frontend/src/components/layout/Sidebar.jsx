import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

// Normalise the `items` prop into an array of sections so the renderer has
// one shape to walk. Old shape (flat array of nav items) is auto-wrapped as
// a single nameless section so existing call sites and tests keep working.
const normaliseSections = (items) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const looksSectioned =
    items[0] &&
    typeof items[0] === 'object' &&
    Array.isArray(items[0].items);
  if (looksSectioned) return items;
  return [{ section: null, items }];
};

const getInitial = (name = '') => {
  const trimmed = String(name).trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
};

const getDisplayName = (name = '') => {
  const trimmed = String(name).trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
};

const SidebarItem = ({ item }) => {
  const { label, to, icon: Icon, iconSolid: IconSolid, disabled } = item;
  if (disabled) {
    return (
      <li>
        <div
          aria-disabled="true"
          title="Coming soon"
          className="flex items-center gap-3 px-6 py-2 text-sm text-ink-inverse/50 cursor-not-allowed"
        >
          {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
          <span>{label}</span>
        </div>
      </li>
    );
  }
  return (
    <li>
      <NavLink
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
          [
            'flex items-center gap-3 px-6 py-2 text-sm transition',
            isActive
              ? 'bg-brand-accent text-ink font-semibold'
              : 'text-ink-inverse hover:bg-brand/40',
          ].join(' ')
        }
      >
        {({ isActive }) => {
          const ActiveIcon = isActive && IconSolid ? IconSolid : Icon;
          return (
            <>
              {ActiveIcon ? (
                <ActiveIcon className="h-5 w-5" aria-hidden="true" />
              ) : null}
              <span>{label}</span>
            </>
          );
        }}
      </NavLink>
    </li>
  );
};

const Sidebar = ({ items = [], brand = 'VacayPlan', className = '' }) => {
  const composed = [
    'hidden md:flex md:w-56 md:flex-col md:bg-brand-dark md:text-ink-inverse md:py-6',
    // Make the sidebar viewport-anchored so the bottom zone (user footer +
    // Logout) stays pinned to the bottom of the viewport even when the nav
    // sections grow tall enough to scroll. h-screen + sticky top-0 + the
    // overflow handling on the inner <nav> (see below) produce a 3-zone
    // layout: brand top, nav middle (scrolls if needed), bottom pinned.
    'md:sticky md:top-0 md:h-screen md:overflow-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();
  const handleLogout = () => {
    if (typeof logout === 'function') logout();
    navigate('/login');
  };

  const sections = normaliseSections(items);
  const displayName = getDisplayName(user?.name);
  const initial = getInitial(user?.name || user?.email);

  return (
    <aside className={composed} aria-label="Primary navigation">
      <div className="px-6 pb-6 text-xl font-semibold flex-shrink-0">{brand}</div>
      <nav className="flex-1 min-h-0 overflow-y-auto">
        {sections.map((section, idx) => (
          <div key={section.section || `section-${idx}`} className="mb-4">
            {section.section ? (
              <div
                className="px-6 pb-1 text-xs font-semibold uppercase tracking-wider text-ink-inverse/60"
                aria-label={`${section.section} section`}
              >
                {section.section}
              </div>
            ) : null}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <SidebarItem
                  key={`${section.section || 'flat'}-${item.label}-${item.to}`}
                  item={item}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {/* Bottom zone: user footer + Logout. flex-shrink-0 so they never get
          compressed and the nav above scrolls instead. */}
      <div className="flex-shrink-0">
        {user ? (
          <div className="px-6 py-3 flex items-center gap-3 border-t border-white/10">
            <div
              className="h-8 w-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold"
              aria-hidden="true"
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink-inverse truncate">
                {displayName || user.email}
              </div>
              <div className="text-xs text-ink-inverse/60">Free plan</div>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-6 py-2 text-sm text-ink-inverse transition hover:bg-brand/40"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
