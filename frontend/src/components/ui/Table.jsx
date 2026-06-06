const Table = ({ className = '', children, ...rest }) => {
  const composed = ['w-full text-left', className].filter(Boolean).join(' ');
  return (
    <table className={composed} {...rest}>
      {children}
    </table>
  );
};

const Head = ({ className = '', children, ...rest }) => {
  const composed = ['bg-surface-muted', className].filter(Boolean).join(' ');
  return (
    <thead className={composed} {...rest}>
      {children}
    </thead>
  );
};

const Body = ({ className = '', children, ...rest }) => (
  <tbody className={className} {...rest}>
    {children}
  </tbody>
);

const Row = ({ className = '', children, ...rest }) => {
  const composed = ['border-b border-surface-border', className]
    .filter(Boolean)
    .join(' ');
  return (
    <tr className={composed} {...rest}>
      {children}
    </tr>
  );
};

const Th = ({ className = '', children, ...rest }) => {
  const composed = [
    'px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <th scope="col" className={composed} {...rest}>
      {children}
    </th>
  );
};

const Td = ({ className = '', children, ...rest }) => {
  const composed = ['px-4 py-3 text-sm text-ink', className]
    .filter(Boolean)
    .join(' ');
  return (
    <td className={composed} {...rest}>
      {children}
    </td>
  );
};

Table.Head = Head;
Table.Body = Body;
Table.Row = Row;
Table.Th = Th;
Table.Td = Td;

export default Table;
