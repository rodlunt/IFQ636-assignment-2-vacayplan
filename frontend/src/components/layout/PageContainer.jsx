const VARIANT_CLASSES = {
  narrow: 'max-w-2xl',
  default: 'max-w-4xl',
  wide: 'max-w-7xl',
};

const PageContainer = ({
  variant = 'default',
  className = '',
  children,
  ...rest
}) => {
  const variantClass =
    variant in VARIANT_CLASSES
      ? VARIANT_CLASSES[variant]
      : VARIANT_CLASSES.default;
  const composed = ['mx-auto w-full px-4 py-6', variantClass, className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={composed} {...rest}>
      {children}
    </div>
  );
};

export default PageContainer;
