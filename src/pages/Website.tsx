import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/ui/header"
import { HeroSection } from "@/components/ui/hero-section"
import { HowItWorks } from "@/components/ui/how-it-works"
export default function Website() {
  const [activeSection, setActiveSection] = useState("home")
  const navigate = useNavigate()
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    switch (sectionId) {
      case 'categories':
        navigate('/categories')
        break
      case 'about':
        navigate('/about')
        break
      case 'market-price':
        navigate('/market-prices')
        break
      case 'verification':
        navigate('/verification')
        break
      case 'price-compare':
        navigate('/price-compare')
        break
      case 'dashboard':
        navigate('/dashboard')
        break
      case 'home':
        navigate('/')
        break
      default:
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
    }
  }
  const handleJoinAsFarmer = () => {
  }
  const handleShopAsCustomer = () => {
  }
  return (
    <div className="min-h-screen bg-background">
      <Header
        activeSection={activeSection}
        onSectionChange={scrollToSection}
      />
      <main>
        <section id="home" className="relative">
          <HeroSection
            onJoinAsFarmer={handleJoinAsFarmer}
            onShopAsCustomer={handleShopAsCustomer}
          />
        </section>
      </main>
    </div>
  )
}