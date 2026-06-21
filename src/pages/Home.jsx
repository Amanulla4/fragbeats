// src/pages/Home.jsx
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Trending from '../components/Trending'
import CTA from '../components/CTA'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

function Home() {
  return (
    <div className="bg-[#040810]">
      <SEO url="/" />
      <Navbar />
      <Hero />
      <Features />
      <Trending />
      <CTA />
      <Footer />
    </div>
  )
}

export default Home