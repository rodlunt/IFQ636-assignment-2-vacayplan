const TEXTAREA_BASE =
  'block w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand disabled:opacity-50 disabled:cursor-not-allowed resize-y';

const Textarea = ({ rows = 4, className = '', ...rest }) => {
  const composed = [TEXTAREA_BASE, className].filter(Boolean).join(' ');
  return <textarea rows={rows} className={composed} {...rest} />;
};

export default Textarea;
