import { NavLink } from 'react-router-dom';
import {
  HomeIcon as HomeIconOutline,
  PlusCircleIcon as PlusIconOutline,
  UserCircleIcon as UserIconOutline,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  PlusCircleIcon as PlusIconSolid,
  UserCircleIcon as UserIconSolid,
} from '@heroicons/react/24/solid';

const TABS = [
  {
    label: 'Home',
    to: '/dashboard',
    iconOutline: HomeIconOutline,
    iconSolid: HomeIconSolid,
  },
  {
    label: 'Add',
    to: '/trips/new',
    iconOutline: PlusIconOutline,
    iconSolid: PlusIconSolid,
    centre: true,
  },
  {
    label: 'Account',
    to: '/profile',
    iconOutline: UserIconOutline,
    iconSolid: UserIconSolid,
  },
];

const BottomNav = ({ className = '' }) => {
  const composed = [
    'fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-surface-border bg-surface md:hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <nav className={composed} aria-label="Bottom navigation">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/dashboard'}
          className={({ isActive }) =>
            [
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-micro font-medium',
              isActive ? 'text-brand' : 'text-ink-muted hover:text-ink',
            ].join(' ')
          }
        >
          {({ isActive }) => {
            const Icon = tab.centre
              ? tab.iconSolid
              : isActive
                ? tab.iconSolid
                : tab.iconOutline;
            return (
              <>
                <Icon
                  className={tab.centre ? 'h-7 w-7 text-brand' : 'h-6 w-6'}
                  aria-hidden="true"
                />
                <span>{tab.label}</span>
              </>
            );
          }}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
