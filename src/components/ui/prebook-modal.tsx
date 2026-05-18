import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone, MapPin, CheckCircle, Receipt } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { toast } from "sonner"
import { apiCall } from "@/lib/api"

interface PrebookModalProps {
    isOpen: boolean;
    onClose: () => void;
    farmer: any;
    product: any;
}

export function PrebookModal({ isOpen, onClose, farmer, product }: PrebookModalProps) {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [quantity, setQuantity] = useState(1)
    const [isBooked, setIsBooked] = useState(false)
    const [orderId, setOrderId] = useState("")

    // Generate a consistent mock phone number for the farmer based on their ID
    const farmerPhone = useMemo(() => {
        if (!farmer) return ""
        let hash = 0
        for (let i = 0; i < farmer.farmerId.length; i++) hash = farmer.farmerId.charCodeAt(i) + ((hash << 5) - hash)
        const num = Math.abs(hash) % 90000000 + 9000000000 // Starts with 9...
        return `+91 ${num.toString().slice(0, 5)} ${num.toString().slice(5)}`
    }, [farmer])

    const handleBooking = async () => {
        if (!user) {
            toast.error("Please login to pre-book products")
            return
        }

        if (quantity <= 0) {
            toast.error("Please enter a valid quantity")
            return
        }

        if (quantity > (farmer.quantity || 0)) {
            toast.error(`Only ${farmer.quantity} ${product.unit} available in stock`)
            return
        }

        try {
            const response = await apiCall('/orders', {
                method: 'POST',
                body: JSON.stringify({
                    product_id: farmer.productId,
                    quantity_booked: quantity,
                    delivery_address: "Standard Delivery",
                    delivery_city: "",
                    delivery_district: "",
                    delivery_state: "",
                    delivery_pincode: ""
                })
            });

            setOrderId(response?.order_id || `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`)
            setIsBooked(true)
            toast.success("Product pre-booked successfully!")
            
            // Fetch orders to update any global state if necessary
            apiCall('/orders').catch(console.error);

        } catch (error: any) {
            toast.error(error.message || "Failed to book product");
        }
    }

    const resetAndClose = () => {
        setIsBooked(false)
        setQuantity(1)
        onClose()
    }

    if (!farmer || !product) return null

    return (
        <Dialog open={isOpen} onOpenChange={resetAndClose}>
            <DialogContent className="sm:max-w-[425px]">
                {isBooked ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4 fade-in">
                        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                        <h2 className="text-2xl font-black text-center">Booking Confirmed!</h2>
                        <p className="text-muted-foreground text-center text-sm">
                            Your order has been sent to {farmer.farmerName}.
                        </p>

                        {/* Receipt Card */}
                        <div className="w-full border-2 border-dashed border-border rounded-xl p-4 mt-4 bg-muted/10 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-5">
                                <Receipt className="w-32 h-32" />
                            </div>
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-border/50">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Order ID</p>
                                    <p className="font-mono font-bold">{orderId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Date</p>
                                    <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Product</span>
                                    <span className="font-bold">{product.name} {product.emoji}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Quantity</span>
                                    <span className="font-bold">{quantity} {product.unit}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Rate</span>
                                    <span className="font-bold">₹{farmer.price}/{product.unit}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Farmer</span>
                                    <span className="font-bold">{farmer.farmerName}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-border/50">
                                <span className="font-black uppercase tracking-wider">Total</span>
                                <span className="text-2xl font-black text-primary">₹{quantity * farmer.price}</span>
                            </div>
                        </div>

                        <Button className="w-full mt-4 btn-primary-glow" onClick={resetAndClose}>
                            Done
                        </Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Farmer Details & Booking</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 pt-2">
                            {/* Farmer Info Card */}
                            <div className="p-4 bg-muted/20 rounded-xl border border-border/50 space-y-3">
                                <div>
                                    <h3 className="font-black text-lg">{farmer.farmerName}</h3>
                                    <div className="flex items-center gap-2 text-yellow-600 text-sm font-bold mt-1">
                                        ★ {farmer.rating.toFixed(1)}
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="w-4 h-4" /> 
                                        <span className="font-medium text-foreground">{farmerPhone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="w-4 h-4" /> 
                                        <span className="font-medium text-foreground">
                                            {farmer.address || "Location unavailable"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Form */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                                            {product.emoji}
                                        </div>
                                        <div>
                                            <p className="font-bold">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">₹{farmer.price}/{product.unit}</p>
                                        </div>
                                    </div>
                                    <div className="w-1/3">
                                        <Label className="text-xs text-muted-foreground flex justify-between">
                                            <span>Quantity ({product.unit})</span>
                                            <span className="font-bold text-primary">{farmer.quantity} {t("left")}</span>
                                        </Label>
                                        <Input 
                                            type="number" 
                                            min="1" 
                                            max={farmer.quantity}
                                            value={quantity} 
                                            onChange={(e) => setQuantity(Number(e.target.value) || 1)} 
                                            className="mt-1 h-8"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-sm font-bold text-muted-foreground">Total Amount:</p>
                                    <p className="text-3xl font-black text-primary">₹{quantity * farmer.price}</p>
                                </div>
                            </div>

                            <Button className="w-full btn-primary-glow" onClick={handleBooking}>
                                {t("pre_book")}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
