import React, { createContext, useContext, useState, useEffect } from "react";
import { apiCall } from "../lib/api";

export interface MarketItem {
  id: string;
  name: string;
  emoji: string;
  currentPrice: number;
  yesterdayPrice: number;
  unit: string;
  category: string;
  trend: "up" | "down" | "stable";
  changePercent: number;
  quantity?: number;
  image?: string;
  farmerId?: string;
  farmerName?: string;
  farmerLocation?: { lat: number; lng: number } | null;
}

interface MarketContextType {
  marketData: MarketItem[];
  loading: boolean;
  addItems: (newItems: { name: string; count: number; rate: number }[], farmerInfo: { id: string, name: string, location: { lat: number, lng: number } | null }, image?: string) => Promise<void>;
  removeItem: (farmerId: string, productName: string) => void;
  completeSale: (farmerId: string, productName: string, quantity: number) => Promise<void>;
  clearMarket: () => void;
  fetchMarketData: () => Promise<void>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("useMarket must be used within a MarketProvider");
  }
  return context;
};

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const data = await apiCall("/products", { requiresAuth: false });
      if (Array.isArray(data)) {
        const mappedData: MarketItem[] = data.map((item: any) => ({
          id: item._id,
          name: item.crop_name,
          emoji: "📦", // Default emoji
          currentPrice: item.price_per_kg,
          yesterdayPrice: item.price_per_kg,
          unit: "kg",
          category: "Produce",
          trend: "stable",
          changePercent: 0,
          quantity: item.quantity_available,
          farmerId: item.farmer_id,
          farmerName: item.farmer_name || "Farmer",
          farmerLocation: item.pickup_location && item.pickup_location.coordinates ? {
            lng: item.pickup_location.coordinates[0],
            lat: item.pickup_location.coordinates[1]
          } : null
        }));
        setMarketData(mappedData);
      }
    } catch (e) {
      console.error("Failed to fetch products", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const addItems = async (newItems: { name: string; count: number; rate: number }[], farmerInfo: { id: string, name: string, location: { lat: number, lng: number } | null }, image?: string) => {
    const freshItems = newItems.filter(item => !item.name.toLowerCase().includes("rotten"));
    
    for (const item of freshItems) {
        try {
            await apiCall("/products", {
                method: "POST",
                body: JSON.stringify({
                    crop_name: item.name,
                    price_per_kg: item.rate,
                    quantity_available: item.count,
                    pickup_longitude: farmerInfo.location?.lng,
                    pickup_latitude: farmerInfo.location?.lat,
                })
            });
        } catch (e) {
            console.error("Failed to add product", e);
        }
    }
    await fetchMarketData();
  };

  const removeItem = (farmerId: string, productName: string) => {
    setMarketData(prev => prev.filter(m => !(m.farmerId === farmerId && m.name === productName)));
  };

  const completeSale = async (farmerId: string, productName: string, qty: number) => {
    const item = marketData.find(m => m.farmerId === farmerId && m.name === productName);
    if (!item) return;

    try {
        await apiCall("/orders", {
            method: "POST",
            body: JSON.stringify({
                product_id: item.id,
                quantity_booked: qty
            })
        });
        await fetchMarketData();
    } catch (e) {
        console.error("Failed to complete sale", e);
        throw e;
    }
  };

  const clearMarket = () => {
    setMarketData([]);
  };

  return (
    <MarketContext.Provider value={{ 
        marketData, 
        loading,
        addItems, 
        removeItem,
        completeSale,
        clearMarket,
        fetchMarketData
      }}>
      {children}
    </MarketContext.Provider>
  );
};
