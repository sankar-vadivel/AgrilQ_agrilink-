import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, Leaf, Target, ArrowRight } from "lucide-react"
import { useLanguage } from "@/context/language-context"

const getValues = (t: any) => [
  {
    icon: Heart,
    title: t("farm_to_fork"),
    description: t("farm_to_fork_desc")
  },
  {
    icon: Users,
    title: t("fair_trade"),
    description: t("fair_trade_desc")
  },
  {
    icon: Leaf,
    title: t("sustainable_ag"),
    description: t("sustainable_ag_desc")
  },
  {
    icon: Target,
    title: t("quality_assurance"),
    description: t("quality_assurance_desc")
  }
]

const stats = [
  { number: "500+", label: "Partner Farmers", description: "Across multiple states" },
  { number: "10K+", label: "Happy Customers", description: "And growing daily" },
  { number: "50+", label: "Product Varieties", description: "Fresh and seasonal" },
  { number: "15+", label: "Cities Served", description: "With free delivery" }
]

export function AboutSection() {
  const { t } = useLanguage()
  const values = getValues(t)
  
  return (
    <section className="py-20 bg-gradient-to-br from-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 fade-slide-up">
          <h2 className="text-4xl font-bold mb-4">{t("about_title")}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("about_desc_1")}
          </p>
        </div>

        {/* Mission Statement */}
        <div className="max-w-4xl mx-auto mb-16 fade-slide-up" style={{ animationDelay: '0.2s' }}>
          <Card className="card-premium shadow-lift">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-6">🌱</div>
              <h3 className="text-2xl font-semibold mb-4">{t("our_mission")}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("our_mission_desc")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <Card 
                key={index} 
                className="card-premium hover:shadow-lift transition-all duration-300 hover:-translate-y-2 fade-slide-up"
                style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
              >
                <CardContent className="p-6 text-center h-full flex flex-col">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 fade-slide-up" style={{ animationDelay: '0.6s' }}>
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-lg font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center fade-slide-up" style={{ animationDelay: '0.8s' }}>
          <div>
            <h3 className="text-3xl font-bold mb-6">{t("our_story")}</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                {t("our_story_desc_1")}
              </p>
              <p>
                {t("our_story_desc_2")}
              </p>
              <p>
                {t("our_story_desc_3")}
              </p>
            </div>
            <Button className="btn-primary-glow mt-6" size="lg">
              {t("join_our_community")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          
          <div className="relative">
            <Card className="card-premium shadow-lift">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🤝</div>
                    <h4 className="text-xl font-semibold mb-2">{t("building_trust")}</h4>
                    <p className="text-muted-foreground">
                      {t("building_trust_desc")}
                    </p>
                  </div>
                  
                  <div className="border-t border-border pt-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-secondary mb-1">100%</div>
                        <div className="text-xs text-muted-foreground">Verified Farmers</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary mb-1">24/7</div>
                        <div className="text-xs text-muted-foreground">Quality Support</div>
                      </div>
                    </div>
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