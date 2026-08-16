export function PageHeader({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-12 max-w-2xl animate-pop-in ${className}`}>
      <h1 className="font-heading text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl sm:leading-[1.05]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 text-lg leading-relaxed text-zinc-600">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
