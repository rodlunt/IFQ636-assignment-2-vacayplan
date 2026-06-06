const PADDING_CLASSES = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const Card = ({ padding = 'md', className = '', children, ...rest }) => {
  const padClass =
    padding in PADDING_CLASSES ? PADDING_CLASSES[padding] : PADDING_CLASSES.md;
  const composed = [
    'bg-surface border border-surface-border rounded-xl',
    padClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={composed} {...rest}>
      {children}
    </div>
  );
};

export default Card;
