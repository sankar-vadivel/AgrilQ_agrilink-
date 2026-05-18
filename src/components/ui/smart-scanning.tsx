import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Scan, Camera, CheckCircle, AlertCircle, Clock, X, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface ScanResult {
  status: "scanning" | "analyzing" | "complete"
  quality: "organic" | "residue-free" | "conventional"
  confidence: number
  details: {
    pesticides: string
    freshness: string
    origin: string
    harvestDate: string
  }
}

export function SmartScanning() {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraOpen(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [isCameraOpen])

  const startCamera = async () => {
    try {
      setScanResult(null)
      setCapturedImage(null)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      setIsCameraOpen(true)
    } catch (err) {
      console.error("Error accessing camera:", err)
      toast.error("Could not access camera. Please ensure you have granted permission.")
    }
  }

  const captureAndScan = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Get data URL
        const imageUrl = canvas.toDataURL('image/png')
        setCapturedImage(imageUrl)

        // Stop camera after capture
        stopCamera()

        // Start Analysis Simulation
        startAnalysis()
      }
    }
  }

  const startAnalysis = () => {
    setScanResult({
      status: "scanning",
      quality: "conventional", // distinct default
      confidence: 0,
      details: {
        pesticides: "Analyzing...",
        freshness: "Calculating...",
        origin: "Locating...",
        harvestDate: "Processing..."
      }
    })
    setScanProgress(0)
  }

  const resetScan = () => {
    setScanResult(null)
    setCapturedImage(null)
    setScanProgress(0)
    startCamera()
  }

  useEffect(() => {
    if (scanResult?.status === "scanning" || scanResult?.status === "analyzing") {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          const newProgress = prev + Math.random() * 10

          if (newProgress >= 40 && scanResult.status === "scanning") {
            setScanResult(prev => prev ? { ...prev, status: "analyzing" } : null)
          }

          if (newProgress >= 100) {
            clearInterval(interval)
            // Final Result Simulation
            const qualities: ScanResult['quality'][] = ["organic", "residue-free", "conventional"]
            const randomQuality = qualities[Math.floor(Math.random() * qualities.length)]

            setScanResult({
              status: "complete",
              quality: randomQuality,
              confidence: 85 + Math.floor(Math.random() * 14),
              details: {
                pesticides: randomQuality === "organic" ? "None detected" : randomQuality === "residue-free" ? "Below MRL limits" : "Standard levels",
                freshness: `${90 + Math.floor(Math.random() * 9)}% - Harvested recently`,
                origin: "Local Farm Partner",
                harvestDate: new Date().toISOString().split('T')[0]
              }
            })
            return 100
          }

          return newProgress
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [scanResult?.status])

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "organic": return "text-success bg-success/10 border-success/20"
      case "residue-free": return "text-secondary bg-secondary/10 border-secondary/20"
      default: return "text-warning bg-warning/10 border-warning/20"
    }
  }

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case "organic": return <CheckCircle className="w-4 h-4" />
      case "residue-free": return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-secondary/5 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 fade-slide-up">
          <h2 className="text-4xl font-bold mb-4">Smart Scanning Technology</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verify product quality instantly with our AI-powered scanning system.
            Know exactly what you're buying before you buy it.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
          {/* Scanning Interface */}
          <div className="fade-slide-up">
            <Card className="card-premium shadow-lift overflow-hidden">
              <CardContent className="p-0">
                {/* Scanner Viewport */}
                <div className="relative aspect-square bg-black flex items-center justify-center">
                  {/* Hidden Canvas for Capture */}
                  <canvas ref={canvasRef} className="hidden" />

                  {!isCameraOpen && !capturedImage && (
                    <div className="text-center text-white/50 p-8">
                      <Camera className="w-16 h-16 mb-4 mx-auto opacity-50" />
                      <p>Camera is off</p>
                      <Button onClick={startCamera} variant="outline" className="mt-4 bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white">
                        Open Camera
                      </Button>
                    </div>
                  )}

                  {isCameraOpen && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}

                  {capturedImage && (
                    <img
                      src={capturedImage}
                      alt="Captured scan"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Scanning Overlay Animation */}
                  {(scanResult?.status === "scanning" || scanResult?.status === "analyzing") && (
                    <div className="absolute inset-0 z-10">
                      <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-[scan_2s_ease-in-out_infinite]" />
                    </div>
                  )}

                  {/* Camera Controls Overlay */}
                  {isCameraOpen && (
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
                      <Button
                        onClick={captureAndScan}
                        size="lg"
                        className="rounded-full h-16 w-16 bg-white border-4 border-white/50 hover:bg-gray-100 hover:scale-105 transition-all p-0 shadow-lg"
                      >
                        <div className="h-12 w-12 rounded-full border-2 border-black/10" />
                      </Button>
                    </div>
                  )}

                  {capturedImage && scanResult?.status === "complete" && (
                    <div className="absolute top-4 right-4 z-20">
                      <Button onClick={resetScan} size="sm" variant="secondary" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Scan Again
                      </Button>
                    </div>
                  )}
                </div>

                {/* Progress Bar (Visible during analysis) */}
                {(scanResult?.status === "scanning" || scanResult?.status === "analyzing") && (
                  <div className="p-6 bg-background border-t">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground font-medium">
                        {scanResult.status === "scanning" ? "Scanning Product..." : "Analyzing Quality..."}
                      </span>
                      <span className="text-primary font-medium">{Math.round(scanProgress)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300 ease-out"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="fade-slide-up h-full" style={{ animationDelay: '0.2s' }}>
            <Card className="card-premium shadow-lift h-full max-h-[600px] overflow-y-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Scan className="w-6 h-6 text-primary" />
                  Scan Results
                </h3>

                {!scanResult ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed rounded-xl border-muted">
                    <Scan className="w-16 h-16 mb-4 opacity-20" />
                    <p>Scan a product to see detailed verification report</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Status Badge */}
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Detected Quality</span>
                        {scanResult.status === "complete" ? (
                          <Badge className={`${getQualityColor(scanResult.quality)} flex items-center gap-2 px-3 py-1 text-base`}>
                            {getQualityIcon(scanResult.quality)}
                            {scanResult.quality === "organic" ? "Certified Organic" :
                              scanResult.quality === "residue-free" ? "Residue-Free" : "Conventional"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="animate-pulse">Analyzing...</Badge>
                        )}
                      </div>

                      {scanResult.status === "complete" && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Confidence Score</span>
                          <span className="font-bold text-primary">{scanResult.confidence}%</span>
                        </div>
                      )}
                    </div>

                    {/* Detailed Metrics */}
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 p-3 rounded-md bg-background border">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pesticides</p>
                          <p className="font-medium">{scanResult.details.pesticides}</p>
                        </div>
                        <div className="space-y-1 p-3 rounded-md bg-background border">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Freshness</p>
                          <p className="font-medium">{scanResult.details.freshness}</p>
                        </div>
                        <div className="space-y-1 p-3 rounded-md bg-background border">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Origin</p>
                          <p className="font-medium">{scanResult.details.origin}</p>
                        </div>
                        <div className="space-y-1 p-3 rounded-md bg-background border">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Harvest Date</p>
                          <p className="font-medium">{scanResult.details.harvestDate}</p>
                        </div>
                      </div>
                    </div>

                    {scanResult.status === "complete" && (
                      <div className="mt-6 pt-6 border-t flex flex-col items-center gap-2 text-center">
                        <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-2">
                          <CheckCircle className="w-6 h-6 text-success" />
                        </div>
                        <h4 className="font-semibold">Verified by AgriLink</h4>
                        <p className="text-sm text-muted-foreground">
                          This product has passed our mock verification standards.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}