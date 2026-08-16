export function SiteSection({
  id,
  title,
  subtitle,
  children,
  className = "",
}: {
  id?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 ${className}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {title && (
            <h2 className="max-w-2xl font-heading text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl sm:leading-[1.1]">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">{subtitle}</p>
          )}
        </div>
      </div>
      {children && <div className="mt-12">{children}</div>}
    </section>
  );
}
