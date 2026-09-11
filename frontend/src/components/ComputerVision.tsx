import { motion, useReducedMotion } from "framer-motion"

import MonitorFrame, { ViewportCorners } from "./MonitorFrame"
import { useClock } from "../hooks/useSystem"

const EASE = [0.22, 1, 0.36, 1] as const

const detections = [
  { type: "PERSON", conf: "0.94", t: "14:22:06" },
  { type: "PERSON", conf: "0.91", t: "14:21:58" },
  { type: "MOTION", conf: "0.82", t: "14:21:40" },
]

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function ComputerVision() {
  const time = useClock("14:22:06")
  const reduce = useReducedMotion()

  return (
    <section id="technology" className="relative border-t border-line-soft py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left: detection monitor */}
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="text-3xl leading-tight font-medium tracking-[-0.015em] text-fg md:text-4xl">
                What the system sees
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
                Every frame is read by the vision model. People are detected,
                highlighted, and logged — the operator sees the signal, not the
                noise.
              </p>
            </Reveal>

            <Reveal delay={0.15} className="mt-10">
              <MonitorFrame
                label="CAM 04 · ENTRANCE"
                rec
                live
                osdBottomLeft="Processing"
                osdBottomRight="FPS 30"
                time={`${time}Z`}
              >
                {/* scene: faint room geometry so the feed reads as a place */}
                <div aria-hidden="true" className="absolute inset-0">
                  <div className="absolute bottom-[18%] left-[8%] h-[46%] w-[26%] border border-white/[0.07] bg-white/[0.015]" />
                  <div className="absolute bottom-[18%] right-[10%] h-[38%] w-[30%] border border-white/[0.06] bg-white/[0.01]" />
                  {/* floor line */}
                  <div className="absolute inset-x-0 bottom-[18%] h-px bg-white/[0.09]" />
                  {/* perspective floor ticks */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-[18%] opacity-40"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, transparent 0, transparent calc(25% - 1px), rgba(255,255,255,0.05) calc(25% - 1px), rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
                      backgroundSize: "25% 100%, 100% 22px",
                    }}
                  />
                </div>

                {/* detection bounding box — person */}
                <motion.figure
                  initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
                  className="absolute top-[24%] left-[46%] h-[46%] w-[17%]"
                >
                  <ViewportCorners color="rgba(255,71,71,0.95)" />
                  <div className="absolute inset-0 bg-rec/[0.03]" />
                  <span className="absolute -top-6 left-0 border border-rec/60 bg-ink-deep/80 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em] whitespace-nowrap text-rec uppercase sm:text-[10px]">
                    Person · 0.94
                  </span>
                  <figcaption className="sr-only">
                    A person detected in the camera feed, highlighted with a
                    bounding box.
                  </figcaption>
                </motion.figure>

                {/* second, dimmer track — someone further away */}
                <div aria-hidden="true" className="absolute bottom-[19%] left-[16%] h-[22%] w-[7%]">
                  <ViewportCorners color="rgba(255,255,255,0.3)" />
                </div>
              </MonitorFrame>
            </Reveal>
          </div>

          {/* Right: what the system understands */}
          <div className="lg:col-span-5">
            <Reveal delay={0.2}>
              <h3 className="font-mono text-[11px] tracking-[0.25em] text-violet-bright uppercase">
                Detection log
              </h3>
              <div className="mt-6 divide-y divide-line-soft border-y border-line-soft">
                {detections.map((d, i) => (
                  <div key={d.t} className="flex items-center justify-between py-3.5 font-mono text-[12px]">
                    <span className={`flex items-center gap-2.5 ${i === 0 ? "text-rec" : "text-muted"}`}>
                      <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                      {d.type}
                    </span>
                    <span className="text-dim">{d.conf}</span>
                    <span className="hidden text-dim sm:inline">{d.t}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 font-mono text-[10px] tracking-[0.14em] text-dim uppercase">
                Representative example · not live data
              </p>
            </Reveal>

            <Reveal delay={0.35} className="mt-12">
              <h3 className="font-mono text-[11px] tracking-[0.25em] text-violet-bright uppercase">
                From frame to review
              </h3>
              <ul className="mt-6 space-y-5">
                {[
                  {
                    k: "Ingest",
                    v: "Video material is uploaded to an organization's case.",
                  },
                  {
                    k: "Detect",
                    v: "The vision model locates people in each frame.",
                  },
                  {
                    k: "Compare",
                    v: "Detections are matched against reference persons.",
                  },
                  {
                    k: "Review",
                    v: "Potential matches are queued for an authorized person.",
                  },
                ].map((row) => (
                  <li key={row.k} className="flex gap-4 border-l border-line pl-4">
                    <div>
                      <div className="text-sm font-medium text-fg">{row.k}</div>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{row.v}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
