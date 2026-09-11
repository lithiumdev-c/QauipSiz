import { motion, useReducedMotion } from "framer-motion"

/**
 * A surveillance-camera viewport: thin white frame, four corner brackets,
 * OSD metadata (top/bottom), and layered CRT screen effects.
 *
 * Props:
 *  - osdTop / osdBottom: { left, right } strings rendered as monospace overlays
 *  - rec: show blinking REC indicator
 *  - children: rendered inside the screen
 */
export function ViewportCorners({ color = "rgba(245,246,248,0.9)" }) {
  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute -top-px -left-px h-3.5 w-3.5 border-t border-l" style={{ borderColor: color }} />
      <span aria-hidden="true" className="pointer-events-none absolute -top-px -right-px h-3.5 w-3.5 border-t border-r" style={{ borderColor: color }} />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -left-px h-3.5 w-3.5 border-b border-l" style={{ borderColor: color }} />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -right-px h-3.5 w-3.5 border-b border-r" style={{ borderColor: color }} />
    </>
  )
}

export default function MonitorFrame({
  label = "CAM 01",
  time,
  rec = true,
  live = true,
  osdBottomLeft = "SIGNAL ACTIVE",
  osdBottomRight = "FPS 30",
  className = "",
  screenClassName = "",
  children,
  delay = 0,
}: {
  label?: string
  time?: string
  rec?: boolean
  live?: boolean
  osdBottomLeft?: string
  osdBottomRight?: string
  className?: string
  screenClassName?: string
  children: React.ReactNode
  delay?: number
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const }}
      className={`relative ${className}`}
    >
      {/* ── Thin white viewport stroke ── */}
      <div className="absolute inset-0 border border-white/25" aria-hidden="true" />
      <ViewportCorners />
      <ViewportCorners color="rgba(245,246,248,0.35)" />
      {/* offset second bracket set for depth — shifted outward */}
      <span aria-hidden="true" className="pointer-events-none absolute -top-1.5 -left-1.5 h-3.5 w-3.5 border-t border-l border-white/40" />
      <span aria-hidden="true" className="pointer-events-none absolute -top-1.5 -right-1.5 h-3.5 w-3.5 border-t border-r border-white/40" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-1.5 -left-1.5 h-3.5 w-3.5 border-b border-l border-white/40" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 border-b border-r border-white/40" />

      {/* ── Screen ── */}
      <div
        className={`relative aspect-[16/10] w-full overflow-hidden bg-ink-deep sm:aspect-[16/8.4] lg:aspect-[16/7.4] ${screenClassName}`}
      >
        {/* base screen glow: low-intensity purple/white illumination */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(85% 70% at 50% 42%, rgba(76,29,149,0.20) 0%, rgba(18,14,32,0.35) 46%, #04050a 100%)",
          }}
        />

        {/* CRT raster + grille + grain */}
        <div aria-hidden="true" className="crt-scanlines absolute inset-0" />
        <div aria-hidden="true" className="crt-grille absolute inset-0" />
        <div aria-hidden="true" className="crt-grain absolute inset-0 opacity-60" />

        {/* occasional bright sweep down the tube */}
        {!reduce && (
          <div
            aria-hidden="true"
            className="animate-sweep absolute inset-x-0 h-16"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(200,190,255,0.055) 45%, rgba(200,190,255,0.085) 50%, rgba(200,190,255,0.055) 55%, transparent)",
            }}
          />
        )}

        {/* content — inside the CRT stack, under the vignette */}
        <div className="absolute inset-0">{children}</div>

        {/* vignette / curvature on top of content */}
        <div aria-hidden="true" className="crt-vignette absolute inset-0" />

        {/* ── OSD overlays (on-screen display, like real cameras) ── */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3.5 font-mono text-[10px] tracking-[0.14em] text-white/55 sm:px-5 sm:text-[11px]">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-violet-bright" />
            {label}
          </span>
          {rec && (
            <span className="flex items-center gap-1.5 text-rec">
              <span aria-hidden="true" className="animate-rec-blink inline-block h-1.5 w-1.5 rounded-full bg-rec" />
              REC
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-3.5 font-mono text-[10px] tracking-[0.14em] text-white/55 sm:px-5 sm:text-[11px]">
          <span>{osdBottomLeft}</span>
          <span className="flex items-center gap-4">
            {time && <span className="hidden text-white/40 sm:inline">{time}</span>}
            {live && <span className="text-violet-bright">LIVE</span>}
            <span>{osdBottomRight}</span>
          </span>
        </div>

        {/* center crosshair — tiny technical marker */}
        <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
          <span className="absolute h-3 w-px -translate-y-1/2 bg-white/20" />
          <span className="absolute h-px w-3 -translate-x-1/2 bg-white/20" />
        </span>
      </div>
    </motion.div>
  )
}
