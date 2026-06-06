import { useId, useRef, useState } from 'react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

const KB = 1024;
const MB = KB * 1024;

const formatBytes = (bytes) => {
  if (bytes == null) return '';
  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
};

const FileUploadZone = ({
  id: idProp,
  label = 'Upload cover photo',
  sublabel = 'PNG, JPG up to 5MB',
  accept = 'image/png,image/jpeg',
  value = null,
  onChange,
  className = '',
}) => {
  const generatedId = useId();
  const inputId = idProp || generatedId;
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (file) => {
    if (!file) {
      setPreview(null);
      onChange?.(null);
      return;
    }
    if (file.type && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result || null);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    onChange?.(file);
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0] || null;
    handleFile(file);
  };

  const handleClear = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (inputRef.current) inputRef.current.value = '';
    setPreview(null);
    onChange?.(null);
  };

  const composed = [
    'relative flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-surface-border bg-surface-muted px-4 py-8 text-center cursor-pointer hover:border-brand hover:bg-brand/5 transition focus-within:ring-2 focus-within:ring-brand',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (value) {
    return (
      <div className="flex items-center gap-3 w-full rounded-xl border border-surface-border bg-surface p-3">
        {preview ? (
          <img
            src={preview}
            alt=""
            className="h-16 w-16 rounded-md object-cover flex-shrink-0"
          />
        ) : (
          <div className="h-16 w-16 rounded-md bg-surface-subtle flex items-center justify-center flex-shrink-0">
            <CloudArrowUpIcon className="h-6 w-6 text-ink-subtle" aria-hidden="true" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">{value.name}</p>
          <p className="text-mini text-ink-muted">{formatBytes(value.size)}</p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-ink-muted hover:text-ink rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Remove file"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <label htmlFor={inputId} className={composed}>
      <CloudArrowUpIcon className="h-10 w-10 text-ink-subtle mb-2" aria-hidden="true" />
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className="text-mini text-ink-muted mt-1">{sublabel}</span>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="sr-only"
      />
    </label>
  );
};

export default FileUploadZone;
