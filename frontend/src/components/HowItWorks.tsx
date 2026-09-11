import { motion, useReducedMotion } from "framer-motion"

const EASE = [0.22, 1, 0.36, 1] as const

const stages = [
  {
    n: "01",
    title: "Camera",
    body: "Video material enters the system from an organization's case — uploaded, stored, and prepared for processing.",
    state: "IN FEED",
  },
  {
    n: "02",
    title: "Computer vision",
    body: "The vision model reads each frame, detects people, and compares them against reference persons to generate potential matches.",
    state: "DETECTED",
  },
  {
    n: "03",
    title: "Human review",
    body: "Potential matches are queued for an authorized reviewer, who confirms or dismisses each candidate. The human decides.",
    state: "PENDING REVIEW",
  },
]

export default function HowItWorks() {
  const reduce = useReducedMotion()

  return (
    <section id="vision" className="border-t border-line-soft bg-panel/30 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <p className="font-mono text-[11px] tracking-[0.25em] text-violet-bright uppercase">
            How it works
          </p>
          <h2 className="mt-4 text-3xl leading-tight font-medium tracking-[-0.015em] text-fg md:text-4xl">
            One signal path, three stages.
          </h2>
        </motion.div>

        <div className="relative mt-16 md:mt-20">
          {/* the signal line — animates down as you scroll */}
          <motion.div
            aria-hidden="true"
            initial={reduce ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            className="absolute top-2 bottom-10 left-[7px] w-px origin-top bg-gradient-to-b from-violet via-violet/50 to-violet/10 md:left-[9px]"
          />

          <ol className="space-y-14 md:space-y-16">
            {stages.map((stage, i) => (
              <motion.li
                key={stage.n}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
                className="relative pl-10 md:pl-14"
              >
                {/* node on the line */}
                <span
                  aria-hidden="true"
                  className={`absolute top-1 left-0 grid h-4 w-4 place-items-center rounded-full border bg-ink md:h-5 md:w-5 ${
                    i === 0 ? "border-violet" : "border-line"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      i === 0 ? "animate-rec-blink bg-violet-bright" : "bg-dim"
                    }`}
                  />
                </span>

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
                  <div className="md:w-56 md:shrink-0">
                    <span className="font-mono text-[11px] tracking-[0.2em] text-dim">
                      {stage.n}
                    </span>
                    <h3 className="mt-2 text-xl font-medium tracking-[-0.01em] text-fg">
                      {stage.title}
                    </h3>
                    <span className="mt-2 inline-block border border-line px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] text-muted uppercase">
                      {stage.state}
                    </span>
                  </div>
                  <p className="max-w-xl text-[15px] leading-relaxed text-muted md:mt-1">
                    {stage.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
