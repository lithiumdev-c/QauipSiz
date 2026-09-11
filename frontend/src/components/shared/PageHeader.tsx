export function PageHeader({
  label,
  title,
  description,
  actions,
}: {
  label: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[11px] tracking-[0.25em] text-violet-bright uppercase">{label}</p>
        <h1 className="mt-2 text-2xl font-medium tracking-[-0.01em] text-fg">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
