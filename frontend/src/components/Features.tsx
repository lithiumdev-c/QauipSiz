import { motion, useReducedMotion } from "framer-motion"

const EASE = [0.22, 1, 0.36, 1] as const

const rows = [
  {
    n: "01",
    title: "Visual analysis",
    body: "QauipSiz analyzes visual information from cameras — frames, motion, and context — without constant human monitoring.",
  },
  {
    n: "02",
    title: "Human review",
    body: "Potential matches are never final conclusions. They are presented to authorized reviewers, who confirm or dismiss each candidate.",
  },
]

export default function Features() {
  const reduce = useReducedMotion()
  const reveal = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.8, delay, ease: EASE },
  })

  return (
    <section id="features" className="border-t border-line-soft py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <motion.p {...reveal()} className="font-mono text-[11px] tracking-[0.25em] text-violet-bright uppercase">
          Product
        </motion.p>
        <motion.h2
          {...reveal(0.08)}
          className="mt-4 max-w-xl text-3xl leading-tight font-medium tracking-[-0.015em] text-fg md:text-4xl"
        >
          A vision system that pays attention.
        </motion.h2>

        <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-14">
          {/* Dominant feature - the core capability */}
          <motion.article {...reveal(0.1)} className="md:col-span-7">
            <h3 className="text-2xl font-medium tracking-[-0.01em] text-fg">
              Real-time detection
            </h3>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              Computer vision identifies people within video material as it is
              processed. When a person is found, they are highlighted, logged,
              and connected to the case they belong to.
            </p>

            {/* micro-visualization: detection pipeline states */}
            <div className="mt-10 border-t border-line pt-6">
              <ol className="grid grid-cols-3 gap-4 font-mono text-[10px] tracking-[0.16em] text-dim uppercase">
                <li className="space-y-2">
                  <div className="h-1.5 w-full bg-violet/70" />
                  Frame
                </li>
                <li className="space-y-2">
                  <div className="h-1.5 w-full bg-line" />
                  <span className="text-muted">Detect</span>
                </li>
                <li className="space-y-2">
                  <div className="h-1.5 w-full bg-line" />
                  <span className="text-muted">Match</span>
                </li>
              </ol>
              <p className="mt-5 font-mono text-[10px] tracking-[0.14em] text-dim uppercase">
                Pipeline stages
              </p>
            </div>
          </motion.article>

          {/* Two numbered supporting rows */}
          <div className="flex flex-col gap-10 md:col-span-5 md:border-l md:border-line-soft md:pl-10 md:gap-12">
            {rows.map((row, i) => (
              <motion.article key={row.n} {...reveal(0.2 + i * 0.12)}>
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-[11px] text-violet-bright">{row.n}</span>
                  <h3 className="text-lg font-medium tracking-[-0.01em] text-fg">
                    {row.title}
                  </h3>
                </div>
                <p className="mt-3 pl-9 text-[15px] leading-relaxed text-muted">
                  {row.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
