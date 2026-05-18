import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp, TrendingDown, Minus, IndianRupee, ShoppingCart,
  BarChart3, Calendar, Wallet, ArrowUpRight, ArrowDownRight,
  Package, Layers,
} from "lucide-react"
import { useMarket } from "@/context/market-context"
import { useAuth } from "@/context/auth-context"
import { apiCall } from "@/lib/api"

/* ── types ─────────────────────────── */
type Period = "day" | "week" | "month" | "year"

interface SalesEntry {
  label: string
  revenue: number
  cost: number
  transactions: number
}

/* ── mock data generator ──────────── */
function generateMockData(period: Period, seed: number): SalesEntry[] {
  const rng = (i: number) => {
    const x = Math.sin(seed * 100 + i * 37) * 10000
    return x - Math.floor(x)
  }

  switch (period) {
    case "day":
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${i.toString().padStart(2, "0")}:00`,
        revenue: Math.round(200 + rng(i) * 1800),
        cost: Math.round(100 + rng(i + 50) * 900),
        transactions: Math.round(1 + rng(i + 99) * 8),
      }))
    case "week":
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
        label: d,
        revenue: Math.round(3000 + rng(i) * 12000),
        cost: Math.round(1500 + rng(i + 50) * 6000),
        transactions: Math.round(5 + rng(i + 99) * 30),
      }))
    case "month":
      return Array.from({ length: 30 }, (_, i) => ({
        label: `${i + 1}`,
        revenue: Math.round(2000 + rng(i) * 8000),
        cost: Math.round(1000 + rng(i + 50) * 4000),
        transactions: Math.round(3 + rng(i + 99) * 15),
      }))
    case "year":
      return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({
        label: m,
        revenue: Math.round(40000 + rng(i) * 80000),
        cost: Math.round(20000 + rng(i + 50) * 40000),
        transactions: Math.round(50 + rng(i + 99) * 200),
      }))
  }
}

/* ── SVG Bar Chart ────────────────── */
function BarChart({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal: number }) {
  const w = 600, h = 220, pad = 40, barGap = 4
  const barW = Math.max(4, (w - pad * 2) / data.length - barGap)
  const gridLines = 4

  return (
    <svg viewBox={`0 0 ${w} ${h + 30}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {Array.from({ length: gridLines + 1 }, (_, i) => {
        const y = pad + (h - pad) * (i / gridLines)
        const val = Math.round(maxVal * (1 - i / gridLines))
        return (
          <g key={i}>
            <line x1={pad} x2={w - 10} y1={y} y2={y} stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />
            <text x={pad - 5} y={y + 4} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize="9" fontWeight="600">
              {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
            </text>
          </g>
        )
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const barH = maxVal > 0 ? ((d.value / maxVal) * (h - pad)) : 0
        const x = pad + i * (barW + barGap)
        const y = h - barH
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill={d.color} opacity={0.85}>
              <animate attributeName="height" from="0" to={barH} dur="0.6s" fill="freeze" />
              <animate attributeName="y" from={h} to={y} dur="0.6s" fill="freeze" />
            </rect>
            {data.length <= 12 && (
              <text x={x + barW / 2} y={h + 16} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9" fontWeight="600">
                {d.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ── SVG Line Chart ───────────────── */
function LineChart({ datasets, labels, maxVal }: {
  datasets: { data: number[]; color: string; label: string }[]
  labels: string[]
  maxVal: number
}) {
  const w = 600, h = 220, pad = 40
  const stepX = (w - pad - 10) / Math.max(labels.length - 1, 1)
  const gridLines = 4

  return (
    <svg viewBox={`0 0 ${w} ${h + 30}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      {Array.from({ length: gridLines + 1 }, (_, i) => {
        const y = pad + (h - pad) * (i / gridLines)
        const val = Math.round(maxVal * (1 - i / gridLines))
        return (
          <g key={i}>
            <line x1={pad} x2={w - 10} y1={y} y2={y} stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />
            <text x={pad - 5} y={y + 4} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize="9" fontWeight="600">
              {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
            </text>
          </g>
        )
      })}
      {/* Lines */}
      {datasets.map((ds, di) => {
        const points = ds.data.map((v, i) => {
          const x = pad + i * stepX
          const y = h - (maxVal > 0 ? (v / maxVal) * (h - pad) : 0)
          return `${x},${y}`
        }).join(" ")
        return (
          <g key={di}>
            <polyline points={points} fill="none" stroke={ds.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {ds.data.map((v, i) => {
              const x = pad + i * stepX
              const y = h - (maxVal > 0 ? (v / maxVal) * (h - pad) : 0)
              return <circle key={i} cx={x} cy={y} r="3" fill={ds.color} stroke="white" strokeWidth="1.5" />
            })}
          </g>
        )
      })}
      {/* Labels */}
      {labels.length <= 12 && labels.map((l, i) => (
        <text key={i} x={pad + i * stepX} y={h + 16} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9" fontWeight="600">
          {l}
        </text>
      ))}
    </svg>
  )
}

/* ── Stat Card ────────────────────── */
function StatCard({ icon: Icon, label, value, sub, trend, color }: {
  icon: any; label: string; value: string; sub?: string; trend?: number; color: string
}) {
  return (
    <Card className="card-premium overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend !== undefined && (
            <Badge className={`text-[10px] font-bold px-2 py-0.5 border ${
              trend > 0 ? "bg-emerald-500/10 border-emerald-500/20 text-success" :
              trend < 0 ? "bg-red-500/10 border-red-500/20 text-destructive" :
              "bg-muted/20 border-muted/30 text-muted-foreground"
            }`}>
              {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : trend < 0 ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : <Minus className="w-3 h-3 mr-0.5" />}
              {trend > 0 ? "+" : ""}{trend}%
            </Badge>
          )}
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-black text-foreground">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

/* ── Donut Chart ──────────────────── */
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const r = 60, cx = 80, cy = 80, sw = 18
  let angle = -90

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0
          const a = pct * 360
          const startAngle = angle
          angle += a
          const startRad = (startAngle * Math.PI) / 180
          const endRad = ((startAngle + a) * Math.PI) / 180
          const largeArc = a > 180 ? 1 : 0
          const x1 = cx + r * Math.cos(startRad)
          const y1 = cy + r * Math.sin(startRad)
          const x2 = cx + r * Math.cos(endRad)
          const y2 = cy + r * Math.sin(endRad)
          return (
            <path key={i}
              d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none" stroke={seg.color} strokeWidth={sw} strokeLinecap="round"
            />
          )
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="16" fontWeight="900">
          ₹{total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9" fontWeight="600">
          Total
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-xs font-medium text-muted-foreground">{seg.label}</span>
            <span className="text-xs font-bold ml-auto">₹{seg.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Top Products Table ───────────── */
function TopProducts({ data }: { data: SalesEntry[]; }) {
  const { marketData } = useMarket()
  const products = useMemo(() => {
    return marketData.slice(0, 5).map((item, i) => {
      const rev = Math.round(data.reduce((s, d) => s + d.revenue, 0) * (0.3 - i * 0.04))
      const qty = Math.round(rev / item.currentPrice)
      return { name: item.name, emoji: item.emoji, revenue: rev, qty, price: item.currentPrice }
    })
  }, [marketData, data])

  return (
    <div className="space-y-3">
      {products.map((p, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-lg">{p.emoji}</span>
            <div>
              <p className="text-sm font-bold">{p.name}</p>
              <p className="text-[10px] text-muted-foreground">{p.qty} units × ₹{p.price}</p>
            </div>
          </div>
          <p className="text-sm font-black">₹{p.revenue.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════ */
/*  MAIN DASHBOARD                    */
/* ═══════════════════════════════════ */
export function FarmerDashboard() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<Period>("week")
  const [chartType, setChartType] = useState<"bar" | "line">("bar")

  const seed = useMemo(() => {
    const uid = user?.uid || "default"
    let h = 0
    for (let i = 0; i < uid.length; i++) h = ((h << 5) - h + uid.charCodeAt(i)) | 0
    return Math.abs(h)
  }, [user?.uid])

  const [realOrders, setRealOrders] = useState<any[]>([])

  useEffect(() => {
    const fetchRealOrders = async () => {
      try {
        const orders = await apiCall('/orders');
        if (Array.isArray(orders)) {
          const mappedOrders = orders.map((o: any) => ({
            id: o._id,
            date: o.created_at,
            completedDate: o.created_at,
            totalPrice: o.total_price,
            quantity: o.quantity_booked,
            productName: o.product_name || "Product",
            status: "Completed",
          }));
          setRealOrders(mappedOrders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    }
    
    if (user?.uid) {
        fetchRealOrders();
    }
  }, [user?.uid])



  const realTotals = useMemo(() => {
    const now = new Date()
    const filtered = realOrders.filter(o => {
      const d = new Date(o.completedDate || o.date)
      if (period === "day") return d.toDateString() === now.toDateString()
      if (period === "week") {
        const weekAgo = new Date()
        weekAgo.setDate(now.getDate() - 7)
        return d >= weekAgo
      }
      if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      return d.getFullYear() === now.getFullYear()
    })

    const revenue = filtered.reduce((s, o) => s + (o.totalPrice || 0), 0)
    const txns = filtered.length
    const cost = revenue * 0.45 // Estimate cost as 45% of revenue for mock purposes
    const profit = revenue - cost
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
    return { revenue, cost, txns, profit, margin }
  }, [realOrders, period])

  const totals = realTotals

  const data = useMemo(() => {
    // Group real orders into time slots for the charts
    const now = new Date()
    
    if (period === "day") {
      return Array.from({ length: 24 }, (_, i) => {
        const hour = i
        const hourOrders = realOrders.filter(o => {
          const d = new Date(o.completedDate || o.date)
          return d.toDateString() === now.toDateString() && d.getHours() === hour
        })
        const rev = hourOrders.reduce((s, o) => s + (o.totalPrice || 0), 0)
        return {
          label: `${hour.toString().padStart(2, "0")}:00`,
          revenue: rev,
          cost: rev * 0.45,
          transactions: hourOrders.length
        }
      })
    }
    
    if (period === "week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      return days.map((d, i) => {
        const dayOrders = realOrders.filter(o => {
          const od = new Date(o.completedDate || o.date)
          // Find if order was in last 7 days and matches this weekday
          const dayIdx = (od.getDay() + 6) % 7 // Monday = 0
          return dayIdx === i && (now.getTime() - od.getTime()) < 7 * 24 * 60 * 60 * 1000
        })
        const rev = dayOrders.reduce((s, o) => s + (o.totalPrice || 0), 0)
        return { label: d, revenue: rev, cost: rev * 0.45, transactions: dayOrders.length }
      })
    }

    if (period === "month") {
      return Array.from({ length: 30 }, (_, i) => {
        const day = i + 1
        const dayOrders = realOrders.filter(o => {
          const od = new Date(o.completedDate || o.date)
          return od.getDate() === day && od.getMonth() === now.getMonth() && od.getFullYear() === now.getFullYear()
        })
        const rev = dayOrders.reduce((s, o) => s + (o.totalPrice || 0), 0)
        return { label: `${day}`, revenue: rev, cost: rev * 0.45, transactions: dayOrders.length }
      })
    }

    // Default: Year
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    return months.map((m, i) => {
      const monthOrders = realOrders.filter(o => {
        const od = new Date(o.completedDate || o.date)
        return od.getMonth() === i && od.getFullYear() === now.getFullYear()
      })
      const rev = monthOrders.reduce((s, o) => s + (o.totalPrice || 0), 0)
      return { label: m, revenue: rev, cost: rev * 0.45, transactions: monthOrders.length }
    })
  }, [realOrders, period])

  const prevData = useMemo(() => generateMockData(period, seed + 1), [period, seed])
  const prevTotals = useMemo(() => {
    const revenue = prevData.reduce((s, d) => s + d.revenue, 0)
    const cost = prevData.reduce((s, d) => s + d.cost, 0)
    const txns = prevData.reduce((s, d) => s + d.transactions, 0)
    return { revenue, cost, txns }
  }, [prevData])

  const trends = {
    revenue: 0,
    cost: 0,
    txns: 0,
  }

  const chartMax = Math.max(...data.map(d => Math.max(d.revenue, d.cost)), 100) * 1.15

  const periodLabels: Record<Period, string> = { day: "Today", week: "This Week", month: "This Month", year: "This Year" }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 fade-slide-up">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-3">
              <BarChart3 className="w-3.5 h-3.5" /> Sales Analytics
            </div>
            <h2 className="text-3xl font-black">Hello, {user?.displayName || "Farmer"} 👋</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground text-sm">Here's your sales performance for <span className="font-bold text-foreground">{periodLabels[period]}</span></p>
              {realOrders.length > 0 && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] animate-pulse">
                  ● Live Data
                </Badge>
              )}
            </div>
          </div>

          {/* Period selector */}
          <div className="flex gap-1.5 p-1 bg-muted/30 rounded-xl border border-border">
            {(["day", "week", "month", "year"] as Period[]).map((p) => (
              <Button key={p} size="sm" variant={period === p ? "default" : "ghost"}
                onClick={() => setPeriod(p)}
                className={`text-xs capitalize px-4 ${period === p ? "btn-primary-glow shadow-md" : "hover:bg-muted/50"}`}>
                {p}
              </Button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 fade-slide-up" style={{ animationDelay: "0.1s" }}>
          <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${totals.revenue.toLocaleString()}`}
            sub={`vs ₹${prevTotals.revenue.toLocaleString()} prev`} trend={trends.revenue}
            color="bg-emerald-500/10 text-emerald-600" />
          <StatCard icon={ShoppingCart} label="Transactions" value={totals.txns.toLocaleString()}
            sub={`${(totals.txns / data.length).toFixed(1)} avg per ${period === "year" ? "month" : period === "month" ? "day" : period === "week" ? "day" : "hour"}`}
            trend={trends.txns} color="bg-blue-500/10 text-blue-600" />
          <StatCard icon={Wallet} label={totals.profit >= 0 ? "Profit" : "Loss"}
            value={`₹${Math.abs(totals.profit).toLocaleString()}`}
            sub={`${totals.margin}% margin`}
            trend={totals.margin} color={totals.profit >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"} />
          <StatCard icon={Package} label="Total Cost" value={`₹${totals.cost.toLocaleString()}`}
            sub="Expenses this period" trend={trends.cost}
            color="bg-amber-500/10 text-amber-600" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue vs Cost Chart */}
          <Card className="card-premium lg:col-span-2 fade-slide-up" style={{ animationDelay: "0.15s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Revenue vs Cost</h3>
                  <p className="text-xs text-muted-foreground">{periodLabels[period]} breakdown</p>
                </div>
                <div className="flex gap-1.5 p-0.5 bg-muted/30 rounded-lg border border-border">
                  <button onClick={() => setChartType("bar")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${chartType === "bar" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>
                    Bar
                  </button>
                  <button onClick={() => setChartType("line")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${chartType === "line" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>
                    Line
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex gap-4 mb-4">
                <span className="flex items-center gap-1.5 text-[11px] font-bold">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Revenue
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold">
                  <span className="w-3 h-3 rounded-sm bg-red-400" /> Cost
                </span>
              </div>

              {chartType === "bar" ? (
                <div className="overflow-x-auto">
                  <div style={{ minWidth: period === "month" || period === "day" ? "700px" : "auto" }}>
                    <BarChart
                      data={data.flatMap((d, i) => [
                        { label: d.label, value: d.revenue, color: "hsl(150, 60%, 45%)" },
                        { label: "", value: d.cost, color: "hsl(0, 70%, 65%)" },
                      ])}
                      maxVal={chartMax}
                    />
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div style={{ minWidth: period === "month" || period === "day" ? "700px" : "auto" }}>
                    <LineChart
                      datasets={[
                        { data: data.map(d => d.revenue), color: "hsl(150, 60%, 45%)", label: "Revenue" },
                        { data: data.map(d => d.cost), color: "hsl(0, 70%, 65%)", label: "Cost" },
                      ]}
                      labels={data.map(d => d.label)}
                      maxVal={chartMax}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profit Donut */}
          <Card className="card-premium fade-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-1">Profit Breakdown</h3>
              <p className="text-xs text-muted-foreground mb-6">{periodLabels[period]}</p>
              <DonutChart segments={[
                { label: "Profit", value: Math.max(totals.profit, 0), color: "hsl(150, 60%, 45%)" },
                { label: "Cost", value: totals.cost, color: "hsl(0, 70%, 65%)" },
              ]} />
              <div className="mt-6 p-3 rounded-xl bg-muted/20">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Profit Margin</span>
                  <span className={`font-black ${totals.margin >= 0 ? "text-success" : "text-destructive"}`}>{totals.margin}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${totals.margin >= 0 ? "bg-success" : "bg-destructive"}`}
                    style={{ width: `${Math.min(Math.abs(totals.margin), 100)}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid lg:grid-cols-2 gap-6 fade-slide-up" style={{ animationDelay: "0.25s" }}>
          {/* Top Products */}
          <Card className="card-premium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold">Top Selling Products</h3>
                  <p className="text-xs text-muted-foreground">{periodLabels[period]} — by revenue</p>
                </div>
                <Layers className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {realOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">No sales data yet</p>
                ) : (
                  // Group by product name
                  Object.values(realOrders.reduce((acc, o) => {
                    if (!acc[o.productName]) acc[o.productName] = { name: o.productName, rev: 0, qty: 0 }
                    acc[o.productName].rev += o.totalPrice
                    acc[o.productName].qty += o.quantity
                    return acc
                  }, {} as any))
                  .sort((a: any, b: any) => b.rev - a.rev)
                  .slice(0, 5)
                  .map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.qty} units sold</p>
                        </div>
                      </div>
                      <p className="text-sm font-black">₹{p.rev.toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transactions Chart */}
          <Card className="card-premium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold">Transaction Volume</h3>
                  <p className="text-xs text-muted-foreground">{periodLabels[period]} — orders over time</p>
                </div>
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="overflow-x-auto">
                <div style={{ minWidth: period === "month" || period === "day" ? "700px" : "auto" }}>
                  <BarChart
                    data={data.map(d => ({ label: d.label, value: d.transactions, color: "hsl(217, 70%, 55%)" }))}
                    maxVal={Math.max(...data.map(d => d.transactions)) * 1.2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
