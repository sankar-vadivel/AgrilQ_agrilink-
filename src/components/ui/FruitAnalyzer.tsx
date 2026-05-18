import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Scan, Upload, CheckCircle, AlertCircle, ShoppingCart, RefreshCw, Layers, Pencil, IndianRupee, MapPin, Star, Scale } from "lucide-react"
import { toast } from "sonner"
import { useMarket, type MarketItem } from "@/context/market-context"
import { useAuth } from "@/context/auth-context"

/* ── Match to market data ────────────────────────────── */
function findMarketMatch(name: string, data: MarketItem[]) {
  return data.find(m =>
    m.name.toLowerCase() === name.toLowerCase() ||
    m.name.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(m.name.toLowerCase())
  )
}

/* ── Average weight per piece (kg) ───────────────────── */
const AVG_WEIGHT_KG: Record<string, number> = {
  "Tomato": 0.025, "Onion": 0.12, "Potato": 0.15, "Banana": 0.12,
  "Red Apple": 0.25, "Apple": 0.25, "Green Apple": 0.25, "Orange": 0.2,
  "Lemon": 0.06, "Grapes": 0.15, "Carrot": 0.1, "Capsicum": 0.15,
  "Mango": 0.25, "Guava": 0.15, "Pomegranate": 0.3, "Cucumber": 0.2,
  "Brinjal": 0.12, "Jujube": 0.02,
}

interface DetectedProduct {
  rawName: string
  name: string
  breed: string
  quality: "fresh" | "rotten"
  itemConfidence: number
  count: number
  emoji: string
  category: string
  unit: string
  marketPrice: number
  farmerPrice: number
  estWeightKg: number
}

interface AnalysisResult {
  status: "idle" | "analyzing" | "complete"
  products: DetectedProduct[]
  confidence: number
}

export function FruitAnalyzer() {
  const { marketData: currentMarketData, addItems } = useMarket()
  const { user, userRole } = useAuth()
  const isFarmer = userRole === "farmer"

  const [result, setResult] = useState<AnalysisResult>({
    status: "idle", products: [], confidence: 0,
  })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ── Image handling ──────────────────────────────────── */
  const resizeImage = (base64Str: string): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image()
      img.src = base64Str
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX_WIDTH = 600
        const scale = MAX_WIDTH / img.width
        canvas.width = MAX_WIDTH
        canvas.height = img.height * scale
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.7))
      }
    })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file."); return }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const compressed = await resizeImage(ev.target?.result as string)
      setSelectedImage(compressed)
      setResult({ status: "analyzing", products: [], confidence: 0 })
    }
    reader.readAsDataURL(file)
  }

  const resetAnalysis = () => {
    setResult({ status: "idle", products: [], confidence: 0 })
    setSelectedImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  /* ── Update farmer price ─────────────────────────────── */
  const updatePrice = useCallback((idx: number, newPrice: number) => {
    setResult((prev) => {
      const products = [...prev.products]
      products[idx] = { ...products[idx], farmerPrice: newPrice }
      return { ...prev, products }
    })
  }, [])

  /* ── AI Inference ────────────────────────────────────── */
  useEffect(() => {
    if (result.status !== "analyzing" || !selectedImage) return

    const run = async () => {
      try {
        const res = await fetch(selectedImage)
        const blob = await res.blob()
        const fd = new FormData()
        fd.append("image", blob, "upload.jpg")

        const response = await fetch("http://localhost:5000/predict", { method: "POST", body: fd })
        if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Server error")

        const data = await response.json()

        // Backend now returns: baseName, quality, breed, confidence per item
        const products: DetectedProduct[] = data.items.map((item: any) => {
          const baseName = item.baseName || item.name
          const quality = (item.quality || "Fresh").toLowerCase() as "fresh" | "rotten"
          const breed = item.breed || "Common"
          const match = findMarketMatch(baseName, currentMarketData)
          const marketPrice = match?.currentPrice ?? 50
          const avgW = AVG_WEIGHT_KG[baseName] || AVG_WEIGHT_KG[match?.name || ""] || 0.15

          return {
            rawName: item.name,
            name: match?.name || baseName,
            breed,
            quality,
            itemConfidence: item.confidence || data.confidence,
            count: item.count,
            emoji: match?.emoji || "📦",
            category: match?.category || "Produce",
            unit: match?.unit || "kg",
            marketPrice,
            farmerPrice: marketPrice,
            estWeightKg: Math.round(item.count * avgW * 100) / 100,
          }
        })

        setResult({ status: "complete", products, confidence: data.confidence })
      } catch (err) {
        console.error("AI Server Error:", err)
        toast.error("AI Server not connected. Please run 'python scanner_api.py'")
        setTimeout(resetAnalysis, 3000)
      }
    }

    run()
  }, [result.status, selectedImage, currentMarketData])

  /* ── Totals ──────────────────────────────────────────── */
  const freshProducts = result.products.filter((p) => p.quality === "fresh")
  const rottenProducts = result.products.filter((p) => p.quality === "rotten")
  const totalItems = result.products.reduce((s, p) => s + p.count, 0)
  const totalValue = freshProducts.reduce((s, p) => s + p.estWeightKg * p.farmerPrice, 0)

  /* ── RENDER ──────────────────────────────────────────── */
  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 fade-slide-up">
          <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30 text-primary bg-primary/5">
            AI Powered Analysis
          </Badge>
          <h2 className="text-4xl font-bold mb-4">Fruit & Veggie Analyzer</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload a product image — AI detects the <strong>name</strong>, <strong>count</strong>, <strong>quality</strong>, and <strong>market price</strong> instantly.
          </p>
        </div>

        {/* Upload Area */}
        <div className="max-w-2xl mx-auto mb-10 fade-slide-up">
          <Card className="card-premium shadow-lift overflow-hidden border-primary/10">
            <CardContent className="p-0">
              <div className="relative min-h-[300px] bg-muted/30 flex items-center justify-center">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />

                {!selectedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full min-h-[300px] border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all group m-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Upload Product Image</h3>
                    <p className="text-muted-foreground text-sm px-8 text-center">
                      Supports JPG, PNG, WEBP — our AI will detect everything in the image
                    </p>
                  </div>
                ) : (
                  <div className="relative w-full">
                    <img src={selectedImage} alt="Uploaded product" className="w-full h-auto max-h-[400px] object-cover" />

                    {result.status === "analyzing" && (
                      <div className="absolute inset-0 z-10">
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-[scan_2s_ease-in-out_infinite]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-white text-lg font-bold">Detecting items...</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {result.status === "complete" && (
                      <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <Badge className="bg-black/60 backdrop-blur-md text-white border-0 px-3 py-1">
                          {totalItems} items detected
                        </Badge>
                        <Button onClick={resetAnalysis} size="sm" variant="secondary" className="gap-1.5 shadow-lg backdrop-blur-md bg-white/80">
                          <RefreshCw className="w-3.5 h-3.5" /> New
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detection Results — Product Cards */}
        {result.status === "complete" && result.products.length > 0 && (
          <div className="max-w-4xl mx-auto fade-slide-up" style={{ animationDelay: "0.1s" }}>
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">Detection Results</p>
                  <p className="text-[11px] text-muted-foreground">
                    {result.confidence}% confidence • {totalItems} total items • {freshProducts.length} fresh, {rottenProducts.length} rotten
                  </p>
                </div>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-5">
              {result.products.map((p, idx) => {
                const isFresh = p.quality === "fresh"
                return (
                  <Card key={idx} className={`card-premium overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${!isFresh ? "opacity-70" : ""}`}>
                    <CardContent className="p-0">
                      {/* Product header with image */}
                      <div className="flex items-start gap-4 p-5 pb-3">
                        {/* Emoji / thumbnail */}
                        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center text-3xl flex-shrink-0 border border-border/50">
                          {p.emoji}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-lg font-black leading-tight">{p.name}</h4>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {p.breed} variety • {p.itemConfidence}% match
                                {p.name.includes("Tomato") && " • Usually 9-12 items per 250g"}
                                {p.name.includes("Apple") && " • Estimated 250g per apple"}
                              </p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <Badge variant="secondary" className="text-[10px] px-2 py-0">{p.category}</Badge>
                                  <Badge className={`text-[10px] px-2 py-0 border ${
                                    isFresh
                                      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                      : "bg-red-500/10 text-red-700 border-red-500/20"
                                  }`}>
                                    {isFresh ? <CheckCircle className="w-3 h-3 mr-0.5" /> : <AlertCircle className="w-3 h-3 mr-0.5" />}
                                    {isFresh ? "Fresh" : "Rotten"}
                                  </Badge>
                                  {isFarmer && currentMarketData.some(m => m.name === p.name && m.farmerId === user?.uid) && (
                                    <Badge variant="outline" className="text-[10px] px-2 py-0 border-blue-500/30 text-blue-600 bg-blue-500/5">
                                      Existing Product
                                    </Badge>
                                  )}
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-px bg-border/30 mx-5 rounded-xl overflow-hidden mb-4">
                        <div className="bg-card p-3 text-center">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Count</p>
                          <p className="text-xl font-black text-foreground">{p.count}</p>
                        </div>
                        <div className="bg-card p-3 text-center">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Weight</p>
                          <p className="text-xl font-black text-foreground">~{p.estWeightKg}<span className="text-xs font-normal">kg</span></p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            {p.count} × {(AVG_WEIGHT_KG[p.name] || AVG_WEIGHT_KG[p.rawName] || 0.15) * 1000}g
                          </p>
                        </div>
                        <div className="bg-card p-3 text-center">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Quality</p>
                          <p className={`text-xl font-black ${isFresh ? "text-emerald-600" : "text-red-500"}`}>
                            {isFresh ? "A+" : "Bad"}
                          </p>
                        </div>
                      </div>

                      {/* Price section */}
                      <div className="px-5 pb-5">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Market Price</p>
                            <p className="text-lg font-black">₹{p.marketPrice}<span className="text-xs font-normal text-muted-foreground">/{p.unit}</span></p>
                          </div>
                          {isFarmer && isFresh ? (
                            <div className="text-right">
                              <p className="text-[10px] font-bold uppercase text-primary tracking-widest mb-1">Your Price</p>
                              <div className="relative inline-flex items-center">
                                <IndianRupee className="absolute left-2 w-3.5 h-3.5 text-primary" />
                                <input
                                  type="number"
                                  value={p.farmerPrice}
                                  onChange={(e) => updatePrice(idx, Math.max(0, Number(e.target.value)))}
                                  className="w-24 pl-7 pr-2 py-1.5 rounded-lg border-2 border-primary/30 bg-primary/5 text-base font-black text-primary text-right focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                  min={0} step={1}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-right">
                              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Value</p>
                              <p className="text-lg font-black text-primary">₹{Math.round(p.estWeightKg * p.marketPrice)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Total + List Button */}
            {freshProducts.length > 0 && (
              <Card className="card-premium mt-6 fade-slide-up" style={{ animationDelay: "0.2s" }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-sm font-bold text-muted-foreground">Total Estimated Value (Fresh Items)</p>
                      <p className="text-[11px] text-muted-foreground">
                        {freshProducts.length} product{freshProducts.length !== 1 ? "s" : ""} •{" "}
                        {freshProducts.reduce((s, p) => s + p.count, 0)} items •{" "}
                        ~{freshProducts.reduce((s, p) => s + p.estWeightKg, 0).toFixed(2)} kg
                      </p>
                    </div>
                    <p className="text-4xl font-black text-primary">₹{Math.round(totalValue)}</p>
                  </div>

                  {isFarmer ? (
                    <Button
                      className="w-full btn-primary-glow h-12 text-base group"
                      onClick={() => {
                        if (!user) { toast.error("Please login to list items."); return }
                        addItems(
                          freshProducts.map((p) => ({ name: p.name, count: p.count, rate: p.farmerPrice })),
                          { id: user.uid, name: user.displayName || "Unknown Farmer", location: (user as any).location || null },
                          selectedImage || undefined
                        )
                        toast.success(`${freshProducts.length} product(s) updated and listed on the market!`)
                      }}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Update and List {freshProducts.length} Product{freshProducts.length !== 1 ? "s" : ""}
                    </Button>
                  ) : (
                    <div className="p-4 rounded-xl bg-muted/30 text-center">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-bold text-primary">Login as a farmer</span> to set your own prices and list on the market.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Rotten warning */}
            {rottenProducts.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-start gap-3 fade-slide-up">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700">Rotten Items Detected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rottenProducts.map((p) => `${p.count}× ${p.name}`).join(", ")} — these won't be listed on the market.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state after complete with no items */}
        {result.status === "complete" && result.products.length === 0 && (
          <div className="max-w-md mx-auto text-center py-12">
            <p className="text-lg font-bold text-muted-foreground">No items detected</p>
            <p className="text-sm text-muted-foreground mt-1">Try uploading a clearer image with visible produce.</p>
          </div>
        )}
      </div>
    </section>
  )
}
