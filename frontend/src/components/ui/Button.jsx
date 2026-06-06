const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const VARIANT_CLASSES = {
  primary:
    'bg-brand text-ink-inverse hover:bg-brand-hover focus-visible:ring-brand',
  secondary:
    'bg-surface text-ink border border-surface-border hover:bg-surface-subtle focus-visible:ring-ink/40',
  destructive:
    'bg-danger text-ink-inverse hover:bg-red-700 focus-visible:ring-danger',
  'destructive-soft':
    'bg-danger-bg text-danger hover:bg-red-100 focus-visible:ring-danger/40',
  'ghost-brand':
    'bg-transparent text-brand hover:bg-brand/10 focus-visible:ring-brand',
};

const SIZE_CLASSES = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon,
  type = 'button',
  className = '',
  children,
  ...rest
}) => {
  const composed = [
    BASE,
    VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
    SIZE_CLASSES[size] || SIZE_CLASSES.md,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={composed} {...rest}>
      {LeftIcon ? <LeftIcon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
    </button>
  );
};

export default Button;
