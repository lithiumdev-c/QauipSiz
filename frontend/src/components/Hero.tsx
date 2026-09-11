import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"

import MonitorFrame from "./MonitorFrame"
import { useClock } from "../hooks/useSystem"

const EASE = [0.22, 1, 0.36, 1] as const

export default function Hero() {
  const reduce = useReducedMotion()
  const recTime = useClock("00:00:00")

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* room ambience — extremely faint grid + ceiling light falloff */}
      <div aria-hidden="true" className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-[420px]"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, rgba(139,92,246,0.07), transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        {/* technical label */}
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center font-mono text-[11px] tracking-[0.32em] text-dim uppercase"
        >
          Security &middot; Computer vision
        </motion.p>

        {/* ── THE MONITOR — QauipSiz lives inside this screen ── */}
        <div className="mx-auto mt-8 max-w-3xl md:mt-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
          >
            <div className="animate-crt-flicker">
              <MonitorFrame
                label="CAM 01"
                rec
                live
                osdBottomLeft="Signal: Active"
                osdBottomRight="FPS 30"
                time={recTime}
              >
                {/* the wordmark — displayed BY the monitor */}
                <div className="flex h-full flex-col items-center justify-center px-6">
                  <motion.h1
                    initial={reduce ? false : { opacity: 0, letterSpacing: "0.42em" }}
                    animate={{ opacity: 1, letterSpacing: "0.3em" }}
                    transition={{ duration: 1.4, delay: 0.55, ease: "easeOut" }}
                    className="crt-wordmark relative text-center text-[clamp(1.9rem,7.5vw,4.4rem)] leading-none font-semibold uppercase select-none"
                  >
                    QauipSiz
                  </motion.h1>

                  {/* boot line under the wordmark */}
                  <motion.div
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.5 }}
                    className="mt-5 flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase sm:text-[11px]"
                  >
                    <span aria-hidden="true" className="h-px w-8 bg-white/25" />
                    Video intelligence system
                    <span aria-hidden="true" className="h-px w-8 bg-white/25" />
                  </motion.div>

                  {/* boot progress line — one-shot */}
                  {!reduce && (
                    <div className="mt-4 h-px w-40 overflow-hidden bg-white/10 sm:w-52">
                      <div
                        className="animate-boot-bar h-full origin-left"
                        style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.1), #a78bfa)" }}
                      />
                    </div>
                  )}
                </div>
              </MonitorFrame>
            </div>
          </motion.div>

          {/* measurement ruler under the monitor — technical marker */}
          <motion.div
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mx-auto mt-4 hidden max-w-3xl items-center justify-between px-10 font-mono text-[9px] tracking-[0.2em] text-dim/70 uppercase md:flex"
          >
            <span>Viewport 01</span>
            <div className="relative mx-6 flex-1">
              <div className="h-px w-full bg-line" />
              <span className="absolute top-1/2 left-0 h-2 w-px -translate-y-1/2 bg-line" />
              <span className="absolute top-1/2 left-1/2 h-2 w-px -translate-y-1/2 bg-line" />
              <span className="absolute top-1/2 right-0 h-2 w-px -translate-y-1/2 bg-line" />
            </div>
            <span>16 : 10</span>
          </motion.div>
        </div>

        {/* headline + CTAs */}
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
          className="mx-auto mt-14 max-w-2xl text-center text-3xl leading-[1.12] font-medium tracking-[-0.015em] text-fg md:mt-16 md:text-[2.6rem]"
        >
          Computer vision for safer environments.
        </motion.h2>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
          className="mx-auto mt-5 max-w-xl text-center text-[15px] leading-relaxed text-muted md:text-base"
        >
          QauipSiz analyzes video material, detects people, and surfaces
          potential matches — for authorized human review.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.2, ease: EASE }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/register"
            className="w-full rounded-md bg-violet px-7 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-violet-bright sm:w-auto"
          >
            Explore the system
          </Link>
          <a
            href="https://github.com/lithiumdev-c/QauipSiz"
            target="_blank"
            rel="noreferrer"
            className="w-full rounded-md border border-line px-7 py-3 text-center text-sm text-fg transition-colors hover:border-white/40 hover:bg-panel sm:w-auto"
          >
            View GitHub
          </a>
        </motion.div>
      </div>
    </section>
  )
}
