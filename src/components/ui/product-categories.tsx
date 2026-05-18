import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Leaf, Apple, Milk, Wheat, Package, MoreHorizontal } from "lucide-react"

const categories = [
  {
    name: "Vegetables",
    icon: Leaf,
    emoji: "🥬",
    count: "24 items",
    description: "Fresh leafy greens & seasonal veggies",
    color: "from-success/20 to-success/5",
    borderColor: "border-success/30",
    textColor: "text-success"
  },
  {
    name: "Fruits",
    icon: Apple,
    emoji: "🍎",
    count: "18 items", 
    description: "Juicy seasonal fruits & berries",
    color: "from-warning/20 to-warning/5",
    borderColor: "border-warning/30",
    textColor: "text-warning"
  },
  {
    name: "Dairy",
    icon: Milk,
    emoji: "🥛",
    count: "12 items",
    description: "Fresh milk, cheese & dairy products",
    color: "from-secondary/20 to-secondary/5", 
    borderColor: "border-secondary/30",
    textColor: "text-secondary"
  },
  {
    name: "Pulses",
    icon: Package,
    emoji: "🫘",
    count: "15 items",
    description: "Protein-rich lentils & legumes",
    color: "from-accent/20 to-accent/5",
    borderColor: "border-accent/30", 
    textColor: "text-accent"
  },
  {
    name: "Grains",
    icon: Wheat,
    emoji: "🌾",
    count: "8 items",
    description: "Wholesome cereals & grains",
    color: "from-primary/20 to-primary/5",
    borderColor: "border-primary/30",
    textColor: "text-primary"
  },
  {
    name: "Others",
    icon: MoreHorizontal,
    emoji: "🍯",
    count: "10 items",
    description: "Honey, spices & specialty items",
    color: "from-muted/30 to-muted/10",
    borderColor: "border-muted/50",
    textColor: "text-muted-foreground"
  },
]

interface ProductCategoriesProps {
  onCategorySelect?: (categoryId: string) => void
}

export function ProductCategories({ onCategorySelect }: ProductCategoriesProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center fade-slide-up">
        <div className="flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 text-primary mr-2 heartbeat" />
          <h2 className="text-2xl font-bold">Fresh Categories</h2>
          <Sparkles className="w-6 h-6 text-primary ml-2 heartbeat" />
        </div>
        <p className="text-muted-foreground">
          Discover farm-fresh products organized by category
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {categories.map((category, index) => {
          const Icon = category.icon
          return (
            <Card
              key={category.name}
              className={`group cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border-2 ${category.borderColor} bg-gradient-to-br ${category.color} relative overflow-hidden slide-up-stagger`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onCategorySelect?.(category.name.toLowerCase())}
            >
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                        {category.emoji}
                      </div>
                      <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-foreground/90 transition-colors">
                        {category.name}
                      </h3>
                      <p className={`text-sm ${category.textColor} font-medium`}>
                        {category.count}
                      </p>
                    </div>
                  </div>
                  <Icon className={`w-6 h-6 ${category.textColor} group-hover:scale-110 transition-transform duration-300`} />
                </div>
                
                <p className="text-muted-foreground text-sm mb-4 group-hover:text-muted-foreground/80 transition-colors">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full bg-current ${category.textColor} opacity-60`} />
                    <div className={`w-2 h-2 rounded-full bg-current ${category.textColor} opacity-40`} />
                    <div className={`w-2 h-2 rounded-full bg-current ${category.textColor} opacity-20`} />
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className={`${category.textColor} hover:bg-current/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0`}
                  >
                    Explore →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}