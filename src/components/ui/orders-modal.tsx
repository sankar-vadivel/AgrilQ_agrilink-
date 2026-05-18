import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/auth-context"
import { useMarket } from "@/context/market-context"
import { Package, Receipt, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface OrdersModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

import { Button } from "@/components/ui/button"
import { apiCall } from "@/lib/api"

export function OrdersModal({ isOpen, setIsOpen }: OrdersModalProps) {
    const { user } = useAuth()
    const { completeSale } = useMarket()
    const [orders, setOrders] = useState<any[]>([])

    useEffect(() => {
        fetchOrders()
    }, [isOpen, user])

    const fetchOrders = async () => {
        if (user) {
            try {
                const data = await apiCall('/orders');
                if (Array.isArray(data)) {
                    const mappedOrders = data.map((o: any) => ({
                        id: o._id,
                        date: o.created_at,
                        totalPrice: o.total_price,
                        quantity: o.quantity_booked,
                        productName: o.product_name || "Product",
                        status: o.status || "Completed",
                        farmerName: "Farmer", // Mock until backend supports populate
                        customerName: "Customer" // Mock until backend supports populate
                    }));
                    setOrders(mappedOrders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            }
        }
    }

    const completeOrder = async (orderId: string) => {
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                return { ...o, status: "Completed" };
            }
            return o;
        }));
        toast.success("Transaction marked as completed!")
    }

    if (!user) return null

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        {user.role === "farmer" ? "Received Orders" : "My Bookings & Receipts"}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 pt-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed rounded-xl border-muted/50">
                            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="font-bold text-muted-foreground">No orders found</p>
                        </div>
                    ) : (
                        orders.map((order, i) => (
                            <div key={order.id || i} className="border border-border/50 rounded-xl p-4 bg-muted/10 relative overflow-hidden group hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start mb-3 border-b border-border/50 pb-3">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Order ID</p>
                                        <p className="font-mono font-bold text-sm">{order.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                            order.status === "Completed" ? "bg-emerald-500/20 text-emerald-600" : "bg-blue-500/20 text-blue-600"
                                        }`}>
                                            {order.status}
                                        </span>
                                        <p className="text-xs font-medium text-muted-foreground mt-1">
                                            {new Date(order.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-1 mb-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Product</span>
                                        <span className="font-bold">{order.productName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Quantity</span>
                                        <span className="font-medium">{order.quantity} {order.unit}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {user.role === "farmer" ? "Customer" : "Farmer"}
                                        </span>
                                        <span className="font-medium">
                                            {user.role === "farmer" ? order.customerName : order.farmerName}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                                    <span className="font-bold text-sm uppercase tracking-wider">Total Amount</span>
                                    <span className="text-lg font-black text-primary">₹{order.totalPrice}</span>
                                </div>

                                {user.role === "farmer" && order.status !== "Completed" && (
                                    <Button 
                                        onClick={() => completeOrder(order.id)}
                                        className="w-full mt-4 btn-primary-glow h-9 text-xs"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                                        Mark as Completed
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
