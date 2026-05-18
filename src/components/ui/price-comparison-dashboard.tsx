import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp, TrendingDown, Minus, Search, ArrowUpDown,
  ArrowUp, ArrowDown, MapPin, Star, ShieldCheck, BarChart3,
  ChevronRight, X, Store,
} from "lucide-react"
import { useMarket, type MarketItem } from "@/context/market-context"
import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { PrebookModal } from "./prebook-modal"

// Fix for default marker icons in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

/* ── helpers ──────────────────────────────────────────────── */
const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round(((a - b) / b) * 100))
const diffLabel = (d: number) => (d > 0 ? `+${d}%` : d < 0 ? `${d}%` : "Same")
const diffClr = (d: number) => (d > 0 ? "text-destructive" : d < 0 ? "text-success" : "text-muted-foreground")
const diffBg = (d: number) => (d > 0 ? "bg-red-500/10 border-red-500/20" : d < 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted/20 border-muted/30")

type SortMode = "low-high" | "high-low" | "nearest" | "best-match"

/* ── default market prices (reference baseline) ──────────── */
const DEFAULT_MARKET_PRICES: Record<string, number> = {
  "Tomato": 40, "Onion": 35, "Potato": 28, "Rice": 52, "Wheat": 30,
  "Milk": 56, "Red Apple": 180, "Green Apple": 250, "Banana": 45,
  "Grapes": 120, "Orange": 70, "Lemon": 100,
}

/* ── derive unique products ──────────────────────────────── */
interface ProductInfo { name: string; emoji: string; category: string; unit: string; marketPrice: number }

function useProductList(marketData: MarketItem[]) {
  return useMemo(() => {
    const map = new Map<string, ProductInfo>()
    marketData.forEach((item) => {
      if (!map.has(item.name)) {
        map.set(item.name, {
          name: item.name, emoji: item.emoji, category: item.category, unit: item.unit,
          marketPrice: DEFAULT_MARKET_PRICES[item.name] ?? item.currentPrice,
        })
      }
    })
    return Array.from(map.values())
  }, [marketData])
}

/* ── derive farmers for a product ────────────────────────── */
// Generate a deterministic pseudo-random location in TN based on farmerId
function getFallbackLocation(farmerId: string) {
    let hash = 0;
    for (let i = 0; i < farmerId.length; i++) {
        hash = farmerId.charCodeAt(i) + ((hash << 5) - hash);
    }
    // TN Lat range roughly 9.0 to 12.5, Lng range roughly 77.0 to 79.5
    const lat = 9.0 + (Math.abs(hash) % 3500) / 1000;
    const lng = 77.0 + (Math.abs(hash * 31) % 2500) / 1000;
    
    return { lat, lng, address: "Tamil Nadu (Approx)" };
}

interface FarmerListing { 
  farmerId: string; 
  farmerName: string; 
  price: number; 
  unit: string; 
  diff: number; 
  distance: number; 
  rating: number; 
  location: {lat: number, lng: number} | null; 
  address: string | null;
  quantity: number;
  productId: string;
}

function useFarmerListings(marketData: MarketItem[], productName: string, userLocation?: { lat: number; lng: number } | null) {
  return useMemo(() => {
    if (!productName) return []
    const marketRef = DEFAULT_MARKET_PRICES[productName] ?? marketData.find((m) => m.name === productName)?.currentPrice ?? 0
    // All entries with this product name are farmer listings
    const items = marketData.filter((i) => i.name === productName)
    // Deduplicate by farmerId (keep latest)
    const seen = new Map<string, MarketItem>()
    items.forEach((i) => {
      const key = i.farmerId || i.id
      seen.set(key, i)
    })
    return Array.from(seen.values()).map((i) => {
      const resolvedLocation = i.farmerLocation || getFallbackLocation(i.farmerId || i.id)
      
      let dist = Infinity
      if (userLocation && resolvedLocation) {
        const R = 6371, dLat = ((resolvedLocation.lat - userLocation.lat) * Math.PI) / 180
        const dLon = ((resolvedLocation.lng - userLocation.lng) * Math.PI) / 180
        const a = Math.sin(dLat / 2) ** 2 + Math.cos((userLocation.lat * Math.PI) / 180) * Math.cos((resolvedLocation.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
        dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      }
      return {
        farmerId: i.farmerId || i.id, farmerName: i.farmerName || "Local Farmer",
        price: i.currentPrice, unit: i.unit, diff: pct(i.currentPrice, marketRef),
        distance: dist, rating: 4.2 + Math.random() * 0.8,
        location: resolvedLocation,
        address: resolvedLocation.address || null,
        quantity: i.quantity ?? 0,
        productId: i.id
      }
    })
  }, [marketData, productName, userLocation])
}

/* ────────────────────────────────────────────────────────── */
/*  CUSTOMER VIEW                                            */
/* ────────────────────────────────────────────────────────── */
function CustomerView() {
  const { marketData, removeItem } = useMarket()
  const { user } = useAuth()
  const { t } = useLanguage()
  const products = useProductList(marketData)

  const [query, setQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [sort, setSort] = useState<SortMode>("low-high")
  const [selectedFarmerForBooking, setSelectedFarmerForBooking] = useState<FarmerListing | null>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return products
    return products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
  }, [products, query])

  const listings = useFarmerListings(marketData, selectedProduct, user?.location)
  const sorted = useMemo(() => {
    const arr = [...listings]
    if (sort === "nearest") {
      arr.sort((a, b) => a.distance - b.distance)
    } else if (sort === "best-match") {
      arr.sort((a, b) => {
        const scoreA = a.price + (a.distance === Infinity ? 1000 : a.distance) - (a.rating * 5)
        const scoreB = b.price + (b.distance === Infinity ? 1000 : b.distance) - (b.rating * 5)
        return scoreA - scoreB
      })
    } else {
      arr.sort((a, b) => (sort === "low-high" ? a.price - b.price : b.price - a.price))
    }
    return arr
  }, [listings, sort])

  const product = products.find((p) => p.name === selectedProduct)
  const cheapest = sorted.length > 0 ? Math.min(...sorted.map((s) => s.price)) : 0

  // Default to Trichy, Tamil Nadu if no location
  const mapCenter = user?.location || (sorted.find(f => f.location)?.location) || { lat: 10.7905, lng: 78.7047 }
  
  // Tamil Nadu Bounding Box: [SouthWest, NorthEast]
  const tnBounds: L.LatLngBoundsExpression = [[8.0, 76.0], [13.6, 80.5]]
  return (
    <div className="space-y-8">
      {/* Search bar */}
      <div className="relative max-w-xl mx-auto fade-slide-up">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          id="product-search"
          type="text"
          placeholder={t("search_placeholder")}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedProduct("") }}
          className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-border bg-card text-foreground font-medium text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-soft"
        />
        {query && (
          <button onClick={() => { setQuery(""); setSelectedProduct("") }} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Product chips — shown when no product selected */}
      {!selectedProduct && (
        <div className="fade-slide-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center">
            {query ? `Results for "${query}"` : t("popular_products")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
            {(query ? filtered : products.slice(0, 12)).map((p) => (
              <button
                key={p.name}
                onClick={() => { setSelectedProduct(p.name); setQuery(p.name) }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{p.emoji}</span>
                <span className="text-xs font-bold text-foreground">{t(p.name.toLowerCase())}</span>
                <span className="text-[10px] text-muted-foreground">₹{p.marketPrice}/{p.unit}</span>
              </button>
            ))}
          </div>
          {filtered.length === 0 && query && (
            <p className="text-center text-muted-foreground mt-8">{t("no_products_found")} "{query}"</p>
          )}
        </div>
      )}

      {/* Product detail + farmer listings */}
      {selectedProduct && product && (
        <div className="fade-slide-up" style={{ animationDelay: "0.05s" }}>
          {/* Back + Product header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => { setSelectedProduct(""); setQuery("") }} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <ChevronRight className="w-5 h-5 rotate-180 text-muted-foreground" />
            </button>
            <span className="text-4xl">{product.emoji}</span>
            <div>
              <h3 className="text-2xl font-black">{t(product.name.toLowerCase())}</h3>
              <Badge variant="secondary" className="mt-0.5">{t(product.category.toLowerCase())}</Badge>
            </div>
          </div>

          {/* Market price card */}
          <Card className="card-premium mb-6">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("current_market_price")}</p>
                  <p className="text-3xl font-black text-primary">₹{product.marketPrice}<span className="text-sm font-normal text-muted-foreground ml-1">/{product.unit}</span></p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/20 px-3 py-1">{t("reference")}</Badge>
            </CardContent>
          </Card>

          {/* Sort controls */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-muted-foreground">
              {sorted.length} {t("farmers_selling")} {t(product.name.toLowerCase())}
            </p>
            <div className="flex gap-2 flex-wrap justify-end">
              <Button size="sm" variant={sort === "best-match" ? "default" : "outline"}
                onClick={() => setSort("best-match")} className={`text-xs gap-1.5 ${sort === "best-match" ? "btn-primary-glow" : ""}`}>
                <Star className="w-3.5 h-3.5 fill-current" /> {t("best_match")}
              </Button>
              <Button size="sm" variant={sort === "nearest" ? "default" : "outline"}
                onClick={() => setSort("nearest")} className={`text-xs gap-1.5 ${sort === "nearest" ? "btn-primary-glow" : ""}`}
                disabled={!user?.location}>
                <MapPin className="w-3.5 h-3.5" /> {t("nearest")}
              </Button>
              <Button size="sm" variant={sort === "low-high" ? "default" : "outline"}
                onClick={() => setSort("low-high")} className={`text-xs gap-1.5 ${sort === "low-high" ? "btn-primary-glow" : ""}`}>
                <ArrowUp className="w-3.5 h-3.5" /> {t("low_to_high")}
              </Button>
              <Button size="sm" variant={sort === "high-low" ? "default" : "outline"}
                onClick={() => setSort("high-low")} className={`text-xs gap-1.5 ${sort === "high-low" ? "btn-primary-glow" : ""}`}>
                <ArrowDown className="w-3.5 h-3.5" /> {t("high_to_low")}
              </Button>
            </div>
          </div>

          {/* Farmer listing cards */}
          {sorted.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-3xl border-muted/50">
              <p className="text-lg font-bold text-muted-foreground">{t("no_farmers_listed")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((f, i) => {
                const isCheapest = f.price === cheapest
                return (
                  <Card 
                    key={f.farmerId + i} 
                    className={`overflow-hidden transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${isCheapest ? "ring-2 ring-success/40" : "hover:ring-1 hover:ring-primary/50"}`}
                    onClick={() => setSelectedFarmerForBooking(f)}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center">
                        {/* Rank */}
                        <div className={`w-14 flex-shrink-0 flex flex-col items-center justify-center py-5 ${isCheapest ? "bg-success/10" : "bg-muted/20"}`}>
                          <span className={`text-lg font-black ${isCheapest ? "text-success" : "text-muted-foreground"}`}>#{i + 1}</span>
                          {isCheapest && <ShieldCheck className="w-4 h-4 text-success mt-0.5" />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm truncate">{f.farmerName}</h4>
                              {f.farmerId === user?.uid && (
                                <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20">{t("you")}</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {f.rating.toFixed(1)}
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> 
                                {f.distance !== Infinity ? `${f.distance.toFixed(1)} ${t("km_away")}` : t("distance_unknown")}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                               <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  f.quantity > 5 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                                  f.quantity > 0 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                  "bg-red-500/10 text-red-600 border-red-500/20"
                               }`}>
                                 {f.quantity > 0 ? `${f.quantity} ${f.unit} ${t("available")}` : t("out_of_stock")}
                               </span>
                               {f.farmerId === user?.uid && (
                                 <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     removeItem(user.uid, product?.name || "");
                                   }}
                                   className="h-6 text-[9px] text-red-500 hover:text-red-600 hover:bg-red-500/10 px-2"
                                 >
                                   {t("remove")}
                                 </Button>
                               )}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-black">₹{f.price}<span className="text-xs font-normal text-muted-foreground">/{f.unit}</span></p>
                            <Badge className={`text-[10px] font-bold px-2 py-0.5 border mt-1 ${diffBg(f.diff)} ${diffClr(f.diff)}`}>
                              {f.diff > 0 && <TrendingUp className="w-3 h-3 mr-0.5" />}
                              {f.diff < 0 && <TrendingDown className="w-3 h-3 mr-0.5" />}
                              {f.diff === 0 && <Minus className="w-3 h-3 mr-0.5" />}
                              {diffLabel(f.diff)} {t("vs_market")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Live Map */}
          {sorted.length > 0 && (
            <Card className="card-premium mt-6 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b border-border/50 bg-muted/10">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> {t("live_farmer_map")}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("map_subtitle")}
                  </p>
                </div>
                <div className="h-[400px] w-full z-0 relative">
                  <MapContainer 
                    center={[mapCenter.lat, mapCenter.lng]} 
                    zoom={user?.location ? 10 : 7} 
                    style={{ height: "100%", width: "100%", zIndex: 1 }}
                    maxBounds={tnBounds}
                    maxBoundsViscosity={1.0}
                    minZoom={6}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* Customer Marker */}
                    {user?.location && (
                      <Marker position={[user.location.lat, user.location.lng]}>
                        <Popup>
                          <div className="font-bold">{t("you_are_here")}</div>
                        </Popup>
                      </Marker>
                    )}
                    {/* Farmer Markers */}
                    {sorted.map((f, i) => f.location && (
                      <Marker key={`marker-${i}`} position={[f.location.lat, f.location.lng]}>
                        <Popup>
                          <div className="font-bold">{f.farmerName}</div>
                          <div className="text-sm">Price: ₹{f.price}/{f.unit}</div>
                          <div className="text-xs text-muted-foreground">
                            {f.distance !== Infinity ? `${f.distance.toFixed(1)} ${t("km_away")}` : t("distance_unknown")}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prebook Modal */}
          <PrebookModal 
            isOpen={!!selectedFarmerForBooking} 
            onClose={() => setSelectedFarmerForBooking(null)}
            farmer={selectedFarmerForBooking}
            product={product}
          />
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  FARMER VIEW                                              */
/* ────────────────────────────────────────────────────────── */
function FarmerView() {
  const { marketData, removeItem } = useMarket()
  const { user } = useAuth()
  const { t } = useLanguage()
  const products = useProductList(marketData)
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  // Group all farmer listings by product
  const productFarmers = useMemo(() => {
    const map = new Map<string, { farmerId: string; farmerName: string; price: number; unit: string; isMe: boolean }[]>()
    marketData.forEach((item) => {
      if (!map.has(item.name)) map.set(item.name, [])
      map.get(item.name)!.push({
        farmerId: item.farmerId || item.id,
        farmerName: item.farmerName || "Market Average",
        price: item.currentPrice, unit: item.unit,
        quantity: item.quantity ?? 0,
        isMe: !!(item.farmerId && item.farmerId === user?.uid),
      })
    })
    // Sort each group by price
    map.forEach((arr) => arr.sort((a, b) => a.price - b.price))
    return map
  }, [marketData, user?.uid])

  return (
    <div className="space-y-6">
      <div className="text-center fade-slide-up">
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          {t("farmer_view_sub")}
        </p>
      </div>

      <div className="space-y-3 fade-slide-up" style={{ animationDelay: "0.1s" }}>
        {products.map((p) => {
          const farmers = productFarmers.get(p.name) || []
          const isExpanded = expandedProduct === p.name
          const myListing = farmers.find((f) => f.isMe)
          const cheapest = farmers.length > 0 ? farmers[0].price : 0

          return (
            <Card key={p.name} className="card-premium overflow-hidden">
              <CardContent className="p-0">
                {/* Product row header */}
                <button
                  onClick={() => setExpandedProduct(isExpanded ? null : p.name)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.emoji}</span>
                    <div className="text-left">
                      <p className="font-bold text-sm">{t(p.name.toLowerCase())}</p>
                      <p className="text-[10px] text-muted-foreground">{t(p.category.toLowerCase())} • {farmers.length} {t("farmer")}{farmers.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{t("market")}</p>
                      <p className="text-lg font-black">₹{p.marketPrice}<span className="text-[10px] font-normal text-muted-foreground">/{p.unit}</span></p>
                    </div>
                    {myListing && (
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-success tracking-widest">{t("your_price")}</p>
                        <p className="text-lg font-black text-success">₹{myListing.price}</p>
                      </div>
                    )}
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {/* Expanded farmer list */}
                {isExpanded && (
                  <div className="border-t border-border/50 bg-muted/5">
                    {/* Header row */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/30">
                      <span>{t("farmer")}</span>
                      <span className="w-20 text-right">{t("price")}</span>
                      <span className="w-24 text-center">{t("vs_market")}</span>
                      <span className="w-20 text-center">{t("rank")} / {t("stock")}</span>
                    </div>
                    {farmers.length === 0 ? (
                      <p className="px-5 py-6 text-sm text-muted-foreground text-center">{t("no_farmers_listed")}</p>
                    ) : (
                      farmers.map((f, idx) => (
                        <div key={f.farmerId + idx}
                          className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 items-center border-b border-border/20 last:border-b-0 transition-colors
                            ${f.isMe ? "bg-success/5 border-l-4 border-l-success" : "hover:bg-muted/10"}`}
                        >
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold truncate ${f.isMe ? "text-success" : ""}`}>
                              {f.farmerName} {f.isMe && <span className="text-[10px] font-normal">{t("you")}</span>}
                            </p>
                          </div>
                          <p className={`w-20 text-right text-sm font-black ${f.price === cheapest ? "text-success" : ""}`}>
                            ₹{f.price}<span className="text-[9px] font-normal text-muted-foreground">/{f.unit}</span>
                          </p>
                          <div className="w-24 flex justify-center">
                            <Badge className={`text-[9px] font-bold px-1.5 py-0 border ${diffBg(pct(f.price, p.marketPrice))} ${diffClr(pct(f.price, p.marketPrice))}`}>
                              {diffLabel(pct(f.price, p.marketPrice))}
                            </Badge>
                          </div>
                          <div className="w-20 flex flex-col items-center gap-1">
                            <span className={`text-xs font-black ${idx === 0 ? "text-success" : "text-muted-foreground"}`}>
                              #{idx + 1} {idx === 0 && <ShieldCheck className="w-3 h-3 inline text-success" />}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-bold">{f.quantity} {f.unit} {t("left")}</span>
                          </div>
                          {f.isMe && (
                             <div className="w-auto pl-2">
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   removeItem(user?.uid || "", p.name);
                                 }}
                                 className="h-7 text-[9px] text-red-500 hover:text-red-600 hover:bg-red-500/10 px-2"
                               >
                                 {t("remove")}
                               </Button>
                             </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  MAIN EXPORT                                              */
/* ────────────────────────────────────────────────────────── */
export function PriceComparisonDashboard() {
  const { userRole } = useAuth()
  const { t } = useLanguage()
  const isFarmer = userRole === "farmer"

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10 fade-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <BarChart3 className="w-3.5 h-3.5" />
            {isFarmer ? "Competitive Pricing" : t("price_intelligence")}
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">
            {isFarmer ? "Market Price Overview" : t("compare_prices")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {isFarmer
              ? "See how your prices stack up against other farmers and the market."
              : t("compare_prices_sub")}
          </p>
        </div>

        {isFarmer ? <FarmerView /> : <CustomerView />}
      </div>
    </section>
  )
}
