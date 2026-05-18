import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface Category {
  id: string
  name: string
  emoji: string
  description: string
  productCount: number
  averagePrice: string
  gradient: string
}

const categories: Category[] = [
  {
    id: "vegetables",
    name: "Vegetables",
    emoji: "🥕",
    description: "Fresh, seasonal vegetables from local farms",
    productCount: 45,
    averagePrice: "₹40/kg",
    gradient: "from-green-400/20 to-emerald-500/20"
  },
  {
    id: "fruits",
    name: "Fruits",
    emoji: "🍎",
    description: "Sweet, ripe fruits picked at peak freshness",
    productCount: 32,
    averagePrice: "₹80/kg",
    gradient: "from-red-400/20 to-pink-500/20"
  },
  {
    id: "grains",
    name: "Grains",
    emoji: "🌾",
    description: "Premium quality grains and cereals",
    productCount: 28,
    averagePrice: "₹60/kg",
    gradient: "from-yellow-400/20 to-orange-500/20"
  },
  {
    id: "pulses",
    name: "Pulses",
    emoji: "🫘",
    description: "Protein-rich legumes and lentils",
    productCount: 24,
    averagePrice: "₹120/kg",
    gradient: "from-amber-400/20 to-yellow-600/20"
  },
  {
    id: "dairy",
    name: "Dairy",
    emoji: "🥛",
    description: "Fresh milk and dairy products",
    productCount: 18,
    averagePrice: "₹50/liter",
    gradient: "from-blue-400/20 to-cyan-500/20"
  },
  {
    id: "others",
    name: "Others",
    emoji: "🌿",
    description: "Herbs, spices, and specialty items",
    productCount: 35,
    averagePrice: "₹100/kg",
    gradient: "from-purple-400/20 to-violet-500/20"
  }
]

interface CategoriesSectionProps {
  onCategorySelect?: (categoryId: string) => void
}

export function CategoriesSection({ onCategorySelect }: CategoriesSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 fade-slide-up">
          <h2 className="text-4xl font-bold mb-4">Browse Categories</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover fresh produce from local farms, organized by category for easy shopping.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <Card 
              key={category.id} 
              className="group card-premium hover:shadow-lift transition-all duration-300 hover:-translate-y-2 cursor-pointer animated-border fade-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onCategorySelect?.(category.id)}
            >
              <CardContent className="p-6">
                {/* Background Gradient */}
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  {/* Category Icon */}
                  <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                    {category.emoji}
                  </div>
                  
                  {/* Category Info */}
                  <h3 className="text-xl font-semibold mb-2 text-center">{category.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 text-center leading-relaxed">
                    {category.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{category.productCount}</div>
                      <div className="text-xs text-muted-foreground">Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-secondary">{category.averagePrice}</div>
                      <div className="text-xs text-muted-foreground">Avg. Price</div>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary/10 group-hover:border-primary/30"
                  >
                    Browse {category.name}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 fade-slide-up" style={{ animationDelay: '0.8s' }}>
          <Button size="lg" className="btn-primary-glow px-8">
            View All Categories
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}