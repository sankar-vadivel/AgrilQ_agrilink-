import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/ui/header"
import { SmartScanning } from "@/components/ui/smart-scanning"
import { VerificationSystem } from "@/components/ui/verification-system"
export default function VerificationPage() {
  const [activeSection, setActiveSection] = useState("verification")
  const navigate = useNavigate()
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    switch(sectionId){
      case 'home':
        navigate('/')
        break
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
      default:
        navigate('/')
    }
  }
  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeSection={activeSection} 
        onSectionChange={scrollToSection} 
      />      
      <main className="pt-20">
        {/* Hero Image Section */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img 
            src="/assets/verification-hero.jpg" 
            alt="Quality verification process with inspector checking vegetables for certification" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
        </div>        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Quality Verification
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced verification system ensuring product quality and authenticity
            </p>
          </div>
          <SmartScanning />
          <VerificationSystem />
        </div>
      </main>
    </div>
  )
}