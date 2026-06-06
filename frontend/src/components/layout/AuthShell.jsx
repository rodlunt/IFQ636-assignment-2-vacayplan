const AuthShell = ({
  brandPanel,
  className = '',
  children,
}) => {
  const composed = ['min-h-screen md:flex bg-surface', className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={composed}>
      <aside className="bg-brand-dark text-ink-inverse md:w-1/2 md:flex md:flex-col">
        {brandPanel || (
          <div className="p-8 text-2xl font-semibold md:flex md:flex-1 md:items-center">
            VacayPlan
          </div>
        )}
      </aside>
      <main className="flex-1 p-6 md:flex md:items-center md:justify-center md:p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
};

export default AuthShell;
