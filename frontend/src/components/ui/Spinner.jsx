const SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const Spinner = ({ size = 'md', className = '', label = 'Loading', ...rest }) => {
  const composed = [
    'animate-spin text-brand',
    SIZE_CLASSES[size] || SIZE_CLASSES.md,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <svg
      className={composed}
      role="status"
      aria-label={label}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Spinner;
