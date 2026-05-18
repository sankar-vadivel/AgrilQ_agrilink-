import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, Package, ShoppingCart, ArrowRight } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Farmer Registers",
      description: "Local farmers sign up and verify their farms with quality certifications",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Package,
      title: "Products Uploaded",
      description: "Fresh produce is listed with real-time pricing and availability",
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      icon: ShoppingCart,
      title: "Customers Buy & Verify",
      description: "Customers purchase and verify quality through our smart scanning system",
      color: "text-accent",
      bgColor: "bg-accent/10"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 fade-slide-up">
          <h2 className="text-4xl font-bold mb-4">How AgriLink Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent, and direct. Connect with local farmers in just three easy steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative fade-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <Card className="card-premium h-full hover:shadow-lift transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-8 text-center">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${step.bgColor} mb-6 mt-2`}>
                      <Icon className={`w-8 h-8 ${step.color}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border shadow-sm">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 fade-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <p className="text-sm text-muted-foreground">Active Farmers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary mb-2">10K+</div>
            <p className="text-sm text-muted-foreground">Happy Customers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">50+</div>
            <p className="text-sm text-muted-foreground">Product Categories</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">99%</div>
            <p className="text-sm text-muted-foreground">Quality Rating</p>
          </div>
        </div>
      </div>
    </section>
  )
}