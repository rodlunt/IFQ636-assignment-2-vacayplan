const SOLID_TONE = {
  brand: 'bg-brand text-ink-inverse',
  success: 'bg-success text-ink-inverse',
  warning: 'bg-brand-accent text-ink',
  danger: 'bg-danger text-ink-inverse',
  info: 'bg-info text-ink-inverse',
  neutral: 'bg-ink-muted text-ink-inverse',
};

const SOFT_TONE = {
  brand: 'bg-brand/10 text-brand',
  success: 'bg-success-bg text-success',
  warning: 'bg-brand-accent/20 text-ink',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  neutral: 'bg-surface-subtle text-ink-muted',
};

const Badge = ({
  tone = 'neutral',
  variant = 'soft',
  className = '',
  children,
  ...rest
}) => {
  const tones = variant === 'solid' ? SOLID_TONE : SOFT_TONE;
  const composed = [
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
    tones[tone] || tones.neutral,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={composed} {...rest}>
      {children}
    </span>
  );
};

export default Badge;
