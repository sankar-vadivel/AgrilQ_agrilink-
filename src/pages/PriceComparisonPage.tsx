import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/ui/header"
import { PriceComparisonDashboard } from "@/components/ui/price-comparison-dashboard"
import { useLanguage } from "@/context/language-context"

export default function PriceComparisonPage() {
  const [activeSection, setActiveSection] = useState("price-compare")
  const navigate = useNavigate()
  const { t } = useLanguage()

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    switch (sectionId) {
      case "home":
        navigate("/")
        break
      case "categories":
        navigate("/categories")
        break
      case "about":
        navigate("/about")
        break
      case "market-price":
        navigate("/market-prices")
        break
      case "verification":
        navigate("/verification")
        break
      case "price-compare":
        navigate("/price-compare")
        break
      case "dashboard":
        navigate("/dashboard")
        break
      default:
        navigate("/")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeSection={activeSection}
        onSectionChange={scrollToSection}
      />

      <main className="pt-20">
        {/* Hero Banner */}
        <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-blue-600/20 via-primary/10 to-amber-500/20">
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2">
                {t("price_compare_title")}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {t("price_compare_sub")}
              </p>
            </div>
          </div>
        </div>

        <PriceComparisonDashboard />
      </main>
    </div>
  )
}
