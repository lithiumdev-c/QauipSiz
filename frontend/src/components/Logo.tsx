import logoUrl from "../assets/logo.png"

/**
 * QauipSiz logo + wordmark.
 *
 * To replace the logo with your own asset, simply overwrite one of:
 *   src/assets/logo.svg   (preferred)
 *   src/assets/logo.png
 * and update the import above. The fallback mark below is only used
 * if no asset file exists.
 */
export default function Logo({ size = 28, withWordmark = true, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={logoUrl}
        alt="QauipSiz logo"
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ height: size, width: size }}
      />
      {withWordmark && (
        <span className="text-[15px] font-semibold tracking-[0.02em] text-fg">
          QauipSiz
        </span>
      )}
    </span>
  )
}
