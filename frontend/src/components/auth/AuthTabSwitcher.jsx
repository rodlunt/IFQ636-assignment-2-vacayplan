import { Link } from 'react-router-dom';

const TAB_BASE =
  'flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';
const TAB_ACTIVE = 'bg-surface text-ink shadow-sm';
const TAB_INACTIVE = 'text-ink-muted hover:text-ink';

const TABS = [
  { id: 'signin', label: 'Sign In', to: '/login' },
  { id: 'register', label: 'Register', to: '/register' },
];

const AuthTabSwitcher = ({ activeTab = 'signin', className = '' }) => {
  const composed = [
    'inline-flex w-full items-center gap-1 rounded-lg bg-surface-subtle p-1',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={composed} role="tablist" aria-label="Authentication mode">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        const stateClass = isActive ? TAB_ACTIVE : TAB_INACTIVE;
        return (
          <Link
            key={tab.id}
            to={tab.to}
            role="tab"
            aria-selected={isActive}
            className={`${TAB_BASE} ${stateClass}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};

export default AuthTabSwitcher;
