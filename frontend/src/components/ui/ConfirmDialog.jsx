import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Dialog from './Dialog';
import Button from './Button';
import AlertCallout from './AlertCallout';

const ConfirmDialog = ({
  isOpen,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  loadingLabel,
  error,
  icon: IconOverride,
  onConfirm,
  onCancel,
}) => {
  const Icon = IconOverride || (destructive ? ExclamationTriangleIcon : null);
  const iconTone = destructive ? 'danger' : 'brand';
  const confirmVariant = destructive ? 'destructive' : 'primary';
  const confirmText = loading ? (loadingLabel || `${confirmLabel}…`) : confirmLabel;

  const handleClose = () => {
    if (!loading) onCancel?.();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      title={title}
      icon={Icon}
      iconTone={iconTone}
    >
      {body ? <p className="text-center">{body}</p> : null}
      {error ? (
        <div className="mt-3 flex justify-center">
          <AlertCallout tone="danger">{error}</AlertCallout>
        </div>
      ) : null}
      <div className="mt-5 flex gap-3">
        <Button
          type="button"
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={loading}
          className="flex-1"
        >
          {confirmText}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleClose}
          disabled={loading}
          className="flex-1"
        >
          {cancelLabel}
        </Button>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
