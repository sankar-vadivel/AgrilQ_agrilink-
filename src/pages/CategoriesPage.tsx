import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/ui/header"
import { CategoriesSection } from "@/components/ui/categories-section"
import { useAuth } from "@/context/auth-context"
import { FarmerModule } from "@/components/ui/farmer-module"
import { CustomerModule } from "@/components/ui/customer-module"
import { FruitAnalyzer } from "@/components/ui/FruitAnalyzer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CategoriesPage() {
  const [activeSection, setActiveSection] = useState("categories")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { user, userRole } = useAuth()
  const navigate = useNavigate()

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    switch(sectionId){
      case 'home':
        navigate('/')
        break
      case 'categories':
        navigate('/categories')
        setSelectedCategory(null)
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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeSection={activeSection} 
        onSectionChange={scrollToSection} 
      />
      
      <main className="pt-20">
        {!selectedCategory && (
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img 
              src="/assets/categories-hero.jpg" 
              alt="Fresh organic vegetables and fruits representing diverse product categories" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
          </div>
        )}
        
        <div className="container mx-auto px-4 py-8">
          {selectedCategory ? (
            <div className="space-y-8 fade-slide-up">
              <div className="flex items-center justify-between mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedCategory(null)}
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Categories
                </Button>
                <h2 className="text-3xl font-bold capitalize">{selectedCategory}</h2>
                <div className="w-24" />
              </div>

              {user ? (
                userRole === "farmer" ? (
                  <div className="space-y-12">
                    <FarmerModule />
                    <FruitAnalyzer />
                  </div>
                ) : (
                  <CustomerModule />
                )
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                  <h3 className="text-2xl font-bold mb-4">Please Login to Access {selectedCategory}</h3>
                  <p className="text-muted-foreground mb-8">You need an account to buy from or sell in this category.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  Product Categories
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Explore our wide range of fresh, locally-sourced products directly from farmers
                </p>
              </div>
              
              <CategoriesSection onCategorySelect={handleCategorySelect} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}