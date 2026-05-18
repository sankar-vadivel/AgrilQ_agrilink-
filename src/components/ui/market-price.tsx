import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Trash2, MapPin, Star } from "lucide-react"

import { useMarket } from "@/context/market-context"
import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { toast } from "sonner"

const deg2rad = (deg: number) => deg * (Math.PI / 180)

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity
    const R = 6371
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
}

const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4" />
      case "down": return <TrendingDown className="w-4 h-4" />
      default: return <Minus className="w-4 h-4" />
    }
}

const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-destructive bg-destructive/10 border-destructive/20"
      case "down": return "text-success bg-success/10 border-success/20"
      default: return "text-muted-foreground bg-muted/20 border-muted/30"
    }
}

interface MarketItem {
  id: string
  name: string
  emoji: string
  currentPrice: number
  yesterdayPrice: number
  unit: string
  category: string
  trend: "up" | "down" | "stable"
  changePercent: number
  quantity?: number
  image?: string
  farmerId?: string
  farmerName?: string
  farmerLocation?: { lat: number; lng: number } | null
}

export const marketData: MarketItem[] = [
  { id: "1", name: "Tomato", emoji: "🍅", currentPrice: 40, yesterdayPrice: 45, unit: "kg", category: "Vegetables", trend: "down", changePercent: -11.1, farmerId: "f1", farmerName: "Raj's Farm", farmerLocation: { lat: 18.5204, lng: 73.8567 } },
  { id: "2", name: "Onion", emoji: "🧅", currentPrice: 35, yesterdayPrice: 30, unit: "kg", category: "Vegetables", trend: "up", changePercent: 16.7, farmerId: "f2", farmerName: "Sun Valley", farmerLocation: { lat: 19.0760, lng: 72.8777 } },
  { id: "3", name: "Potato", emoji: "🥔", currentPrice: 28, yesterdayPrice: 28, unit: "kg", category: "Vegetables", trend: "stable", changePercent: 0, farmerId: "f3", farmerName: "Green Earth", farmerLocation: { lat: 19.9975, lng: 73.7898 } },
  { id: "4", name: "Rice", emoji: "🍚", currentPrice: 52, yesterdayPrice: 50, unit: "kg", category: "Grains", trend: "up", changePercent: 4.0, farmerId: "f1", farmerName: "Raj's Farm", farmerLocation: { lat: 18.5204, lng: 73.8567 } },
  { id: "5", name: "Wheat", emoji: "🌾", currentPrice: 30, yesterdayPrice: 32, unit: "kg", category: "Grains", trend: "down", changePercent: -6.3, farmerId: "f4", farmerName: "Golden Harvest", farmerLocation: { lat: 17.6599, lng: 75.9064 } },
  { id: "6", name: "Milk", emoji: "🥛", currentPrice: 56, yesterdayPrice: 56, unit: "liter", category: "Dairy", trend: "stable", changePercent: 0, farmerId: "f5", farmerName: "Fresh Dairies", farmerLocation: { lat: 18.1841, lng: 74.6107 } },
  { id: "7", name: "Red Apple", emoji: "🍎", currentPrice: 180, yesterdayPrice: 190, unit: "kg", category: "Fruits", trend: "down", changePercent: -5.3, farmerId: "f6", farmerName: "Himalayan Orchards", farmerLocation: { lat: 31.1048, lng: 77.1734 } },
  { id: "12", name: "Green Apple", emoji: "🍏", currentPrice: 250, yesterdayPrice: 250, unit: "kg", category: "Fruits", trend: "stable", changePercent: 0, farmerId: "f7", farmerName: "Kashmir Fruits", farmerLocation: { lat: 34.0837, lng: 74.7973 } },
  { id: "8", name: "Banana", emoji: "🍌", currentPrice: 45, yesterdayPrice: 40, unit: "kg", category: "Fruits", trend: "up", changePercent: 12.5, farmerId: "f8", farmerName: "Jalgaon Banana", farmerLocation: { lat: 21.0077, lng: 75.5626 } },
  { id: "9", name: "Grapes", emoji: "🍇", currentPrice: 120, yesterdayPrice: 125, unit: "kg", category: "Fruits", trend: "down", changePercent: -4.0, farmerId: "f3", farmerName: "Green Earth", farmerLocation: { lat: 19.9975, lng: 73.7898 } },
  { id: "10", name: "Orange", emoji: "🍊", currentPrice: 70, yesterdayPrice: 75, unit: "kg", category: "Fruits", trend: "down", changePercent: -6.7, farmerId: "f9", farmerName: "Nagpur Oranges", farmerLocation: { lat: 21.1458, lng: 79.0882 } },
  { id: "11", name: "Lemon", emoji: "🍋", currentPrice: 100, yesterdayPrice: 90, unit: "kg", category: "Fruits", trend: "up", changePercent: 11.1, farmerId: "f1", farmerName: "Raj's Farm", farmerLocation: { lat: 18.5204, lng: 73.8567 } },
]

export function MarketPrice() {
  const { marketData, clearMarket } = useMarket()
  const { user, userRole } = useAuth()
  const { t } = useLanguage()

  const showFarmerLocation = (farmer: any) => {
    if (farmer.farmerLocation) {
        toast.info(`Registered Location: ${farmer.farmerLocation.lat.toFixed(4)}, ${farmer.farmerLocation.lng.toFixed(4)}`, {
            description: `Farmer: ${farmer.farmerName || "Local Farmer"}`,
            action: {
                label: "View Map",
                onClick: () => window.open(`https://www.google.com/maps/search/?api=1&query=${farmer.farmerLocation.lat},${farmer.farmerLocation.lng}`, "_blank")
            }
        })
    } else {
        toast.error("Location data not available for this legacy listing.")
    }
  }

  // Process and group data
  const processedData = marketData
    .filter(item => !item.name.toLowerCase().includes("rotten"))
    .map(item => {
    let dist = Infinity
    if (user?.location && item.farmerLocation) {
        dist = calculateDistance(user.location.lat, user.location.lng, item.farmerLocation.lat, item.farmerLocation.lng)
    } else if (item.farmerId === "1") {
        dist = 2.5 // Mock for static data
    }
    return { ...item, distance: dist }
  })

  // Group by product name
  const grouped = processedData.reduce((acc, item) => {
    if (!acc[item.name]) {
        acc[item.name] = {
            name: item.name,
            emoji: item.emoji,
            image: item.image,
            category: item.category,
            minDistance: item.distance,
            farmers: []
        }
    }
    acc[item.name].farmers.push({
        ...item,
        distance: item.distance,
        rating: 4.5 + Math.random() * 0.5 // Mock rating
    })
    
    if (item.distance < acc[item.name].minDistance) {
        acc[item.name].minDistance = item.distance
    }
    
    return acc
  }, {} as any)

  const sortedGroups = Object.values(grouped).sort((a: any, b: any) => a.minDistance - b.minDistance)

  sortedGroups.forEach((group: any) => {
    group.farmers.sort((a: any, b: any) => a.currentPrice - b.currentPrice)
  })

  return (
    <section className="py-20 bg-gradient-to-br from-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 fade-slide-up relative">
          <h2 className="text-4xl font-bold mb-4">{t("todays_market_prices")}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("market_prices_sub")}
          </p>
          <div className="text-sm text-muted-foreground mt-2">
            {t("last_updated")} {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </div>
          
          {marketData.length > 0 && userRole === "farmer" && (
            <div className="mt-6 flex justify-center">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={clearMarket}
                className="gap-2 shadow-lg hover:scale-105 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                {t("clear_all_listings")}
              </Button>
            </div>
          )}
        </div>

        {marketData.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl border-muted/50 max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-semibold text-muted-foreground">{t("market_is_empty")}</h3>
            <p className="text-muted-foreground mt-2">{t("use_scanner")}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {sortedGroups.map((group: any, index) => (
              <Card 
                key={group.name} 
                className="card-premium hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 fade-slide-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                          {group.image ? (
                            <img src={group.image} alt={group.name} className="w-12 h-12 object-cover rounded-lg" />
                          ) : (
                            group.emoji
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{t(group.name.toLowerCase())}</h3>
                          <Badge variant="secondary" className="mt-1">{t(group.category.toLowerCase())}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">{t("starts_from")}</p>
                        <p className="text-3xl font-black text-primary">₹{group.farmers[0].currentPrice}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3 border-y border-dashed border-border mb-6">
                      <div 
                        className="flex items-center text-sm font-semibold text-success cursor-pointer hover:underline"
                        onClick={() => showFarmerLocation(group.farmers[0])}
                      >
                        <MapPin className="w-4 h-4 mr-1.5" />
                        {group.minDistance === Infinity ? "Local Market" : `${group.minDistance.toFixed(1)} km away`}
                      </div>
                      <div className="text-xs font-bold text-muted-foreground uppercase">
                        {group.farmers.length} {t("farmers_listed")}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("price_by_farmer")}</p>
                      {group.farmers.map((farmer: any) => (
                        <div key={farmer.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="font-bold text-sm">{farmer.farmerName || t("market_average")}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center text-[10px] text-yellow-600 font-bold">
                                <Star className="w-2.5 h-2.5 fill-yellow-500 mr-1" />
                                {farmer.rating.toFixed(1)}
                              </div>
                              <span 
                                className="text-[10px] text-muted-foreground italic cursor-pointer hover:text-primary hover:underline hover:not-italic"
                                onClick={() => showFarmerLocation(farmer)}
                              >
                                {farmer.distance === Infinity ? "" : `${farmer.distance.toFixed(1)}km away`}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-foreground">₹{farmer.currentPrice}<span className="text-[10px] font-normal text-muted-foreground ml-1">/{farmer.unit}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary/5 border-t border-primary/10">
                    <Button className="w-full btn-primary-glow font-bold">
                      {t("view_best_deals")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Market Insights */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 fade-slide-up" style={{ animationDelay: '0.8s' }}>
          <Card className="card-premium text-center">
            <CardContent className="p-6">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-semibold mb-2">{t("market_trend")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("market_trend_sub")}
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-premium text-center">
            <CardContent className="p-6">
              <div className="text-3xl mb-2">🏪</div>
              <h3 className="font-semibold mb-2">{t("active_markets")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("active_markets_sub")}
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-premium text-center">
            <CardContent className="p-6">
              <div className="text-3xl mb-2">⏰</div>
              <h3 className="font-semibold mb-2">{t("update_frequency")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("update_frequency_sub")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}