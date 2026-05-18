import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Users, Truck, Shield } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { useNavigate } from "react-router-dom"

interface HeroSectionProps {
  onJoinAsFarmer: () => void
  onShopAsCustomer: () => void
}

export function HeroSection({ onJoinAsFarmer, onShopAsCustomer }: HeroSectionProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  return (
    <section className="pt-16 min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="fade-slide-up">
              <h1 className="text-5xl lg:text-6xl font-bold gradient-text mb-6 leading-tight">
                {t("hero_title_1")}
                <br />
                <span className="text-foreground">{t("hero_title_2")}</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {t("hero_subtitle")}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 bounce-in" style={{ animationDelay: '0.2s' }}>
              {user ? (
                <Button 
                  size="lg" 
                  className="btn-primary-glow text-lg px-8 py-6 hover:scale-105 transition-transform duration-300"
                  onClick={() => navigate("/categories")}
                >
                  {t("explore_categories")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="btn-primary-glow text-lg px-8 py-6 hover:scale-105 transition-transform duration-300"
                    onClick={onShopAsCustomer}
                  >
                    {t("shop_as_customer")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6 hover:bg-secondary/10 hover:scale-105 transition-all duration-300"
                    onClick={onJoinAsFarmer}
                  >
                    {t("join_as_farmer")}
                    <Users className="w-5 h-5 ml-2" />
                  </Button>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8 zoom-fade" style={{ animationDelay: '0.4s' }}>
              <div className="text-center hover:scale-110 transition-transform duration-300">
                <div className="text-3xl mb-2 elastic-bounce">🌱</div>
                <p className="text-sm font-semibold">{t("fresh")}</p>
                <p className="text-xs text-muted-foreground">{t("fresh_sub")}</p>
              </div>
              <div className="text-center hover:scale-110 transition-transform duration-300">
                <div className="text-3xl mb-2 elastic-bounce" style={{ animationDelay: '0.3s' }}>🤝</div>
                <p className="text-sm font-semibold">{t("direct_trade")}</p>
                <p className="text-xs text-muted-foreground">{t("direct_trade_sub")}</p>
              </div>
              <div className="text-center hover:scale-110 transition-transform duration-300">
                <div className="text-3xl mb-2 elastic-bounce" style={{ animationDelay: '0.6s' }}>✅</div>
                <p className="text-sm font-semibold">{t("verified")}</p>
                <p className="text-xs text-muted-foreground">{t("verified_sub")}</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative slide-rotate" style={{ animationDelay: '0.3s' }}>
            <div className="relative overflow-hidden rounded-2xl shadow-lift hover:shadow-glow transition-all duration-500 hover:scale-105">
              <img 
                src="/assets/hero-agrilink.jpg" 
                alt="Fresh farm produce showcasing AgriLink's quality produce directly from local farms" 
                className="w-full h-[500px] object-cover transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent" />
            </div>
            
            <Card className="absolute -top-6 -right-6 card-premium glass">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t("verified_quality")}</p>
                    <p className="text-xs text-muted-foreground">{t("lab_tested")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}