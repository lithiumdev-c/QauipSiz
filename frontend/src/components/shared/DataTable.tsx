import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  className?: string
  render: (row: T) => React.ReactNode
}

export function DataTable<T>({
  columns,
  rows,
  rowKey: keyOf,
  onRowClick,
  empty,
  className,
}: {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  onRowClick?: (row: T) => void
  empty?: React.ReactNode
  className?: string
}) {
  if (rows.length === 0 && empty) return <>{empty}</>

  return (
    <div className={cn('overflow-x-auto rounded-[10px] border border-line-soft bg-panel', className)}>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line-soft">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 py-3 font-mono text-[10px] tracking-[0.16em] text-dim uppercase',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={keyOf(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
              className={cn(
                'border-b border-line-soft last:border-b-0',
                onRowClick && 'cursor-pointer transition-colors hover:bg-panel-raised focus-visible:bg-panel-raised focus-visible:outline-none',
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3.5 text-fg/90', col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
