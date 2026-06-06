import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const Breadcrumb = ({ items = [], className = '', ...rest }) => {
  if (items.length === 0) return null;
  const composed = [
    'flex items-center gap-1 text-sm text-ink-muted',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <nav aria-label="Breadcrumb" className={composed} {...rest}>
      <ol className="flex items-center gap-1">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <Fragment key={`${item.label}-${idx}`}>
              <li>
                {isLast || !item.to ? (
                  <span
                    className={isLast ? 'text-ink font-medium' : ''}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.to}
                    className="text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-sm"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast ? (
                <li aria-hidden="true">
                  <ChevronRightIcon className="h-3.5 w-3.5 text-ink-subtle" />
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
