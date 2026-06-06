import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

const BASE =
  'inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-sm';

const BackLink = ({ to, href, className = '', children = 'Back', ...rest }) => {
  const composed = [BASE, className].filter(Boolean).join(' ');
  const content = (
    <>
      <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
      {children}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={composed} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href || '#'} className={composed} {...rest}>
      {content}
    </a>
  );
};

export default BackLink;
