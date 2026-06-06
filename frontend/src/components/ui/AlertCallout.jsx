import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const TONE_CLASSES = {
  warning: 'bg-brand-accent/20 text-ink',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  success: 'bg-success-bg text-success',
};

const TONE_ICON = {
  warning: ExclamationTriangleIcon,
  danger: ExclamationCircleIcon,
  info: InformationCircleIcon,
  success: CheckCircleIcon,
};

const AlertCallout = ({
  tone = 'warning',
  icon: IconOverride,
  className = '',
  children,
  ...rest
}) => {
  const Icon = IconOverride || TONE_ICON[tone] || TONE_ICON.warning;
  const composed = [
    'inline-flex items-center gap-2 rounded-full px-3 py-1 text-mini font-medium',
    TONE_CLASSES[tone] || TONE_CLASSES.warning,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const defaultRole = tone === 'danger' ? 'alert' : 'status';
  return (
    <span className={composed} role={defaultRole} {...rest}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {children}
    </span>
  );
};

export default AlertCallout;
