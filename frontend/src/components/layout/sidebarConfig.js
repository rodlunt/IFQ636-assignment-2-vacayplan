import {
  HomeIcon,
  BookmarkIcon,
  GlobeAltIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ShieldCheckIcon as ShieldIconSolid,
} from '@heroicons/react/24/solid';

// Build the default sectioned sidebar items shape used by AppShell.
// Exported separately so individual pages can compose if they need overrides,
// but in practice AppShell calls this automatically when no items prop is set.
export const buildDefaultSidebarItems = (user) => {
  const mainItems = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },
    {
      label: 'Bookmarks',
      to: '/bookmarks',
      icon: BookmarkIcon,
      disabled: true,
    },
    {
      label: 'Explore',
      to: '/explore',
      icon: GlobeAltIcon,
      disabled: true,
    },
  ];

  if (user?.isAdmin) {
    mainItems.push({
      label: 'Admin',
      to: '/admin/users',
      icon: ShieldCheckIcon,
      iconSolid: ShieldIconSolid,
    });
  }

  return [
    { section: 'MAIN', items: mainItems },
    {
      section: 'ACCOUNT',
      items: [
        {
          label: 'Settings',
          to: '/settings',
          icon: Cog6ToothIcon,
          disabled: true,
        },
        {
          label: 'Help',
          to: '/help',
          icon: QuestionMarkCircleIcon,
          disabled: true,
        },
      ],
    },
  ];
};
