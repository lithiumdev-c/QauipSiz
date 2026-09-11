import { motion, useReducedMotion } from "framer-motion"

export default function About() {
  const reduce = useReducedMotion()

  return (
    <section id="about" className="border-t border-line-soft py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
          className="font-mono text-[11px] tracking-[0.25em] text-violet-bright uppercase"
        >
          About
        </motion.p>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
          className="mt-6 text-balance text-2xl leading-snug font-medium tracking-[-0.01em] text-fg md:text-3xl"
        >
          QauipSiz combines computer vision and secure video analysis to help
          authorized organizations process visual information more
          efficiently.
        </motion.p>
      </div>
    </section>
  )
}
