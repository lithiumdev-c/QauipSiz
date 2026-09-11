import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"

import Logo from "./Logo"

const navLinks = [
  { id: "features", label: "Product" },
  { id: "vision", label: "How it works" },
  { id: "technology", label: "Technology" },
  { id: "about", label: "About" },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open
          ? "border-line bg-ink/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link to="/" aria-label="QauipSiz home" className="transition-opacity hover:opacity-80">
          <Logo size={26} />
        </Link>

        {/* Center navigation — absolute on md+, inline in mobile menu */}
        <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 md:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className="rounded-md px-3.5 py-2 text-sm text-muted transition-colors hover:text-fg"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            to="/login"
            className="hidden rounded-md px-4 py-2 text-sm text-muted transition-colors hover:text-fg md:block"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="hidden rounded-md border border-violet/60 bg-violet/10 px-4 py-2 text-sm font-medium text-violet-bright transition-colors hover:border-violet hover:bg-violet/20 md:block"
          >
            Register
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation menu"
            className="grid h-10 w-10 place-items-center rounded-md border border-line text-muted transition-colors hover:text-fg md:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              {open ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            aria-label="Mobile"
            className="overflow-hidden border-t border-line-soft bg-ink/95 backdrop-blur-md md:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2.5 text-[15px] text-muted transition-colors hover:text-fg"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 pt-3">
                <Link
                  to="/login"
                  className="flex-1 rounded-md border border-line px-4 py-2.5 text-center text-sm text-fg transition-colors hover:bg-panel"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex-1 rounded-md bg-violet px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-violet-bright"
                >
                  Register
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
