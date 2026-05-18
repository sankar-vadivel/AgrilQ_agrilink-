import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/ui/header"
import { FarmerDashboard } from "@/components/ui/farmer-dashboard"

export default function FarmerDashboardPage() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const navigate = useNavigate()

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    switch (sectionId) {
      case "home": navigate("/"); break
      case "categories": navigate("/categories"); break
      case "about": navigate("/about"); break
      case "market-price": navigate("/market-prices"); break
      case "verification": navigate("/verification"); break
      case "price-compare": navigate("/price-compare"); break
      case "dashboard": navigate("/dashboard"); break
      default: navigate("/")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeSection={activeSection} onSectionChange={scrollToSection} />
      <main className="pt-20">
        <div className="relative h-40 md:h-48 overflow-hidden bg-gradient-to-br from-emerald-600/20 via-primary/10 to-blue-500/15">
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2">Sales Dashboard</h1>
              <p className="text-muted-foreground text-sm">Track your revenue, transactions & profit at a glance</p>
            </div>
          </div>
        </div>
        <FarmerDashboard />
      </main>
    </div>
  )
}
