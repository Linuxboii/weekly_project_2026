import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import RoleAtAvlokai from './components/RoleAtAvlokai'
import Skills from './components/Skills'
import Music from './components/Music'
import Languages from './components/Languages'
import Contact from './components/Contact'

export default function App() {
  return (
    <main className="relative bg-black min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <RoleAtAvlokai />
      <Skills />
      <Music />
      <Languages />
      <Contact />
      <footer className="py-8 px-6 border-t border-[#27272a] text-center text-sm text-[#71717a]">
        © {new Date().getFullYear()} Nathaniel Francis · Built with ♥ at AvlokAI
      </footer>
    </main>
  )
}
