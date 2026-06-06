import { Link } from 'react-router-dom';

const BASE =
  'text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-sm';

const TextLink = ({ to, href, className = '', children, ...rest }) => {
  const composed = [BASE, className].filter(Boolean).join(' ');
  if (to) {
    return (
      <Link to={to} className={composed} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={composed} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <span className={composed} {...rest}>
      {children}
    </span>
  );
};

export default TextLink;
