import { useState } from 'react';

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Avatar = ({ name = '', src, size = 'md', className = '', ...rest }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = src && !imgFailed;
  const composed = [
    'inline-flex items-center justify-center rounded-full bg-brand text-ink-inverse font-semibold overflow-hidden select-none',
    SIZE_CLASSES[size] || SIZE_CLASSES.md,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={composed} aria-label={name || 'avatar'} {...rest}>
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
};

export default Avatar;
