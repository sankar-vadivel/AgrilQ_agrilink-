import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Scan, TrendingUp, Package, DollarSign, BarChart3, Users, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"

const marketPrices = [
  { name: "Tomatoes", price: "₹40/kg", trend: "+5%", status: "high", change: "up" },
  { name: "Onions", price: "₹35/kg", trend: "-2%", status: "stable", change: "down" },
  { name: "Potatoes", price: "₹28/kg", trend: "+8%", status: "high", change: "up" },
  { name: "Carrots", price: "₹32/kg", trend: "+3%", status: "stable", change: "up" },
  { name: "Wheat", price: "₹30/kg", trend: "-1%", status: "stable", change: "down" },
]

const myProducts = [
  { name: "Organic Tomatoes", stock: "50 kg", price: "₹45/kg", verified: true, sold: 35, total: 50 },
  { name: "Fresh Onions", stock: "100 kg", price: "₹38/kg", verified: true, sold: 78, total: 100 },
  { name: "Baby Carrots", stock: "25 kg", price: "₹36/kg", verified: false, sold: 12, total: 25 },
]

const farmStats = [
  { label: "Today's Sales", value: "₹2,450", icon: DollarSign, color: "text-success", trend: "+12%" },
  { label: "Active Orders", value: "23", icon: Package, color: "text-primary", trend: "+5" },
  { label: "Total Customers", value: "156", icon: Users, color: "text-secondary", trend: "+8" },
  { label: "Quality Score", value: "4.8/5", icon: CheckCircle2, color: "text-warning", trend: "↗" },
]

export function FarmerModule() {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => {
      setScanResult({
        product: "Organic Tomatoes",
        quality: "Grade A",
        moisture: "12%",
        pesticides: "None detected",
        organic: true,
        score: 95
      })
      setScanning(false)
    }, 2000)
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Welcome Section */}
      <div className="text-center fade-slide-up">
        <div className="flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 text-secondary mr-2 heartbeat" />
          <h2 className="text-2xl font-bold">Farm Dashboard</h2>
          <Sparkles className="w-6 h-6 text-secondary ml-2 heartbeat" />
        </div>
        <p className="text-muted-foreground">Manage your products and track performance</p>
      </div>

      {/* Farm Statistics */}
      <div className="grid grid-cols-2 gap-3 fade-slide-up" style={{ animationDelay: '0.1s' }}>
        {farmStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className={`card-premium slide-up-stagger hover:scale-105 transition-all duration-300`} style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <Badge variant="secondary" className="text-xs">{stat.trend}</Badge>
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Market Prices */}
      <Card className="card-premium fade-slide-up shadow-lift" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-secondary" />
            Market Prices Today
            <Badge variant="outline" className="ml-auto text-xs">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {marketPrices.map((item, index) => (
              <div
                key={item.name}
                className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 hover:from-muted/30 hover:to-muted/20 transition-all duration-300 hover:scale-[1.02] slide-up-stagger border border-border/50`}
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-8 rounded-full ${item.change === 'up' ? 'bg-success' : 'bg-warning'}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-lg gradient-text">{item.price}</span>
                  <Badge
                    variant={item.status === "high" ? "default" : "secondary"}
                    className={`${item.change === 'up' ? 'text-success' : 'text-warning'} font-medium`}
                  >
                    {item.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Scanner */}
      <Card className="card-premium fade-slide-up shadow-lift" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scan className="w-5 h-5 mr-2 text-primary" />
            Product Verification
            <Badge variant="outline" className="ml-auto text-xs">AI Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!scanResult ? (
            <div className="text-center space-y-6">
              <div className={`w-40 h-40 mx-auto border-2 border-dashed rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 ${scanning ? 'border-primary bg-primary/5 scan-animation' : 'border-muted-foreground hover:border-primary/50'
                }`}>
                <Camera className={`w-12 h-12 transition-all duration-300 ${scanning ? 'text-primary scale-110' : 'text-muted-foreground'}`} />
                {scanning && (
                  <div className="absolute inset-0 border-2 border-primary rounded-2xl animate-pulse" />
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Place your product in front of the camera for AI-powered quality analysis
                </p>
                <Button
                  onClick={handleScan}
                  disabled={scanning}
                  className="w-full btn-primary-glow"
                  size="lg"
                >
                  {scanning ? "Analyzing..." : "Start Scan"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 fade-slide-up">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <h3 className="font-bold text-xl mb-2">{scanResult.product}</h3>
                <Badge variant="default" className="mb-3">
                  {scanResult.organic ? "Certified Organic" : "Conventional"}
                </Badge>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Quality Score</p>
                  <div className="flex items-center space-x-3">
                    <Progress value={scanResult.score} className="flex-1 progress-animated" />
                    <span className="font-bold text-success">{scanResult.score}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <div className="text-2xl mb-2">🏆</div>
                  <p className="text-sm text-muted-foreground">Quality</p>
                  <p className="font-bold text-success">{scanResult.quality}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <div className="text-2xl mb-2">💧</div>
                  <p className="text-sm text-muted-foreground">Moisture</p>
                  <p className="font-bold">{scanResult.moisture}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30 col-span-2">
                  <div className="text-2xl mb-2">🛡️</div>
                  <p className="text-sm text-muted-foreground">Pesticide Status</p>
                  <p className="font-bold text-success">{scanResult.pesticides}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={() => setScanResult(null)} variant="outline" className="flex-1">
                  Scan Another
                </Button>
                <Button className="flex-1 btn-primary-glow">
                  Add to Inventory
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Products */}
      <Card className="card-premium fade-slide-up shadow-lift" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2 text-accent" />
            My Products
            <Badge variant="outline" className="ml-auto text-xs">{myProducts.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myProducts.map((product, index) => (
              <div
                key={product.name}
                className={`p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lift hover:-translate-y-1 bg-gradient-to-r from-card to-card/80 slide-up-stagger`}
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg gradient-text">{product.price}</p>
                    {product.verified ? (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sales Progress</span>
                    <span className="font-medium">{product.sold}/{product.total} kg</span>
                  </div>
                  <Progress
                    value={(product.sold / product.total) * 100}
                    className="progress-animated"
                  />
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Analytics
                  </Button>
                  <Button size="sm" className="flex-1 btn-primary-glow">
                    <Package className="w-3 h-3 mr-1" />
                    Restock
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}