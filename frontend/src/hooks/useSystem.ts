import { useEffect, useState } from "react"

export function useClock(initial = "00:00:00"): string {
  const [time, setTime] = useState(initial)
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date()
      const p = (n: number) => String(n).padStart(2, "0")
      setTime(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`)
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}
