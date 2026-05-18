import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Shield, Leaf, ShoppingCart, Star } from "lucide-react"

import { useMarket } from "@/context/market-context"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"

const deg2rad = (deg: number) => deg * (Math.PI / 180)

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
}

export function CustomerModule() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [cart, setCart] = useState<any[]>([])
  const { marketData } = useMarket()
  const { user } = useAuth()

  const showFarmerLocation = (farmer: any) => {
    if (farmer.farmerLocation || (farmer.id === "1" && !farmer.farmerLocation)) {
        const lat = farmer.farmerLocation?.lat || 18.5204
        const lng = farmer.farmerLocation?.lng || 73.8567
        toast.info(`Registered Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, {
            description: `Farmer: ${farmer.farmerName || "Local Farmer"}`,
            action: {
                label: "View Map",
                onClick: () => window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank")
            }
        })
    } else {
        toast.error("Location data not available for this listing.")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Certified Organic":
      case "Vegetables":
      case "Produce":
        return <Badge className="bg-success text-success-foreground"><Leaf className="w-3 h-3 mr-1" />Premium</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const addToCart = (product: any, farmer: any) => {
    setCart([...cart, { ...product, ...farmer }])
    setSelectedProduct(null)
  }

  // Process data for display
  const processedData = marketData
    .filter(item => !item.name.toLowerCase().includes("rotten"))
    .map(item => {
    let distanceValue = item.farmerId === "1" ? 2.5 : 15 // Mock defaults for static items
    if (user?.location && item.farmerLocation) {
        distanceValue = calculateDistance(
            user.location.lat, user.location.lng,
            item.farmerLocation.lat, item.farmerLocation.lng
        )
    }
    return { ...item, distance: distanceValue }
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
        id: item.id,
        farmerName: item.farmerName || "Local Farmer",
        price: item.currentPrice,
        unit: item.unit,
        distance: item.distance,
        rating: 4.5 + Math.random() * 0.5, // Mock rating
        quantity: item.quantity
    })
    
    // Update min distance for the group
    if (item.distance < acc[item.name].minDistance) {
        acc[item.name].minDistance = item.distance
    }
    
    return acc
  }, {} as any)

  // Sort groups by nearest farmer
  const sortedGroups = Object.values(grouped).sort((a: any, b: any) => a.minDistance - b.minDistance)

  // Sort farmers inside groups by price (lowest first)
  sortedGroups.forEach((group: any) => {
    group.farmers.sort((a: any, b: any) => a.price - b.price)
  })

  const filteredGroups = sortedGroups.filter((group: any) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.farmers.some((f: any) => f.farmerName.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (selectedProduct) {
    return (
      <div className="p-4 space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedProduct(null)}>
            ← Back
          </Button>
          <h1 className="text-xl font-semibold">Product Details</h1>
          <div />
        </div>

        <Card className="animate-fade-in shadow-xl">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{selectedProduct.image || selectedProduct.emoji}</div>
              <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
              <p className="text-muted-foreground">{selectedProduct.category}</p>
            </div>

            <div className="space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Available from Farmers (Nearest First)
              </h3>
              
              <div className="space-y-4">
                {selectedProduct.farmers.map((farmer: any) => (
                  <div key={farmer.id} className="p-4 rounded-xl border bg-muted/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg">{farmer.farmerName}</p>
                        <p 
                            className="text-sm text-muted-foreground cursor-pointer hover:text-primary hover:underline"
                            onClick={() => showFarmerLocation(farmer)}
                        >
                            {farmer.distance.toFixed(1)} km away
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary">₹{farmer.price}<span className="text-sm font-normal text-muted-foreground">/{farmer.unit}</span></p>
                        <div className="flex items-center justify-end text-sm text-yellow-600">
                          <Star className="w-3 h-3 fill-yellow-500 mr-1" />
                          {farmer.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => addToCart(selectedProduct, farmer)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart (₹{farmer.price})
                    </Button>
                  </div>
                ))}
              </div>

              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-3 text-primary" />
                  Product Verifications
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-white rounded-lg shadow-sm border">
                    <p className="text-muted-foreground mb-1">Pesticides</p>
                    <p className="font-bold text-success">None detected</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm border">
                    <p className="text-muted-foreground mb-1">Quality</p>
                    <p className="font-bold text-primary">Grade A+</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Fresh From Farm</h1>
        <p className="text-muted-foreground">Traceable, quality produce from local farmers</p>
      </div>

      {/* Search */}
      <div className="relative animate-slide-up">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search products or farmers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cart indicator */}
      {cart.length > 0 && (
        <Card className="bg-primary/10 border-primary/20 animate-bounce-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary">
                {cart.length} item(s) in cart
              </span>
              <Button size="sm" variant="outline">
                View Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products */}
      <div className="space-y-4">
        {filteredGroups.map((group: any, index) => (
          <Card
            key={group.name}
            className="hover:shadow-lg transition-all cursor-pointer animate-slide-up bg-card/50 backdrop-blur-sm"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setSelectedProduct(group)}
          >
            <CardContent className="p-5">
              <div className="flex items-start space-x-5">
                <div className="text-4xl bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">
                  {group.image ? (
                    <img src={group.image} className="w-12 h-12 object-cover rounded-lg" alt="" />
                  ) : (
                    group.emoji
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-xl">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">{group.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-tighter">Starting from</p>
                      <p className="text-2xl font-black text-primary">₹{group.farmers[0].price}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div 
                        className="flex items-center text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation()
                            showFarmerLocation(group.farmers[0])
                        }}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Nearest: {group.minDistance.toFixed(1)} km
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Available from <span className="font-bold text-foreground">{group.farmers.length} farmers</span>
                    </div>
                  </div>
                  
                  {/* Inside card - show who sales to lowest price 1st (Preview) */}
                  <div className="mt-3 text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg border border-dashed">
                    Best deal: <span className="font-bold text-foreground">{group.farmers[0].farmerName}</span> at <span className="font-bold text-primary">₹{group.farmers[0].price}/{group.farmers[0].unit}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No products found matching your search.
        </div>
      )}
    </div>
  )
}