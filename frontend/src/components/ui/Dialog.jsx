import {
  Dialog as HUIDialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';

const ICON_TONE_CLASSES = {
  brand: 'bg-brand/10 text-brand',
  danger: 'bg-danger-bg text-danger',
  warning: 'bg-brand-accent/20 text-ink',
  success: 'bg-success-bg text-success',
  info: 'bg-info-bg text-info',
};

const Dialog = ({
  open,
  onClose,
  title,
  icon: Icon,
  iconTone = 'brand',
  className = '',
  children,
}) => {
  const iconClass =
    iconTone in ICON_TONE_CLASSES
      ? ICON_TONE_CLASSES[iconTone]
      : ICON_TONE_CLASSES.brand;
  const panelClass = [
    'w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <HUIDialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <DialogBackdrop className="fixed inset-0 bg-ink/40 -z-10" />
      <DialogPanel className={panelClass}>
        {Icon ? (
          <div
            className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${iconClass}`}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        ) : null}
        {title ? (
          <DialogTitle className="text-lg font-semibold text-ink text-center">
            {title}
          </DialogTitle>
        ) : null}
        <div className="mt-2 text-sm text-ink-muted">{children}</div>
      </DialogPanel>
    </HUIDialog>
  );
};

export default Dialog;
