import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useAuth } from '../../context/AuthContext';
import { buildDefaultSidebarItems } from './sidebarConfig';

const AppShell = ({ items, brand = 'VacayPlan', className = '', children }) => {
  const composed = ['min-h-screen flex bg-surface-muted', className]
    .filter(Boolean)
    .join(' ');
  const { user } = useAuth() || {};
  // If a caller explicitly passes items (incl. an empty array for tests),
  // honour it. Otherwise build the default sectioned sidebar from auth state.
  const resolvedItems =
    items !== undefined ? items : buildDefaultSidebarItems(user);
  return (
    <div className={composed}>
      <Sidebar items={resolvedItems} brand={brand} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
};

export default AppShell;
