import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-10 w-full rounded-md border border-line bg-panel px-3.5 text-[15px] text-fg transition-colors placeholder:text-dim/60 focus:border-violet focus:outline-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full resize-none rounded-md border border-line bg-panel px-3.5 py-3 text-[15px] text-fg transition-colors placeholder:text-dim/60 focus:border-violet focus:outline-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block font-mono text-[11px] tracking-[0.14em] text-muted uppercase',
        className,
      )}
      {...props}
    />
  ),
)
Label.displayName = 'Label'

export { Input, Textarea, Label }
