import Nav from "../components/Nav"
import Hero from "../components/Hero"
import Features from "../components/Features"
import HowItWorks from "../components/HowItWorks"
import ComputerVision from "../components/ComputerVision"
import About from "../components/About"
import Footer from "../components/Footer"

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <ComputerVision />
        <About />
      </main>
      <Footer />
    </>
  )
}
