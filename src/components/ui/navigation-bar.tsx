import { cn } from "@/lib/utils"

interface NavigationBarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userRole?: "farmer" | "customer"
}

export function NavigationBar({ activeTab, onTabChange, userRole }: NavigationBarProps) {
  const tabs = [
    { id: "home", label: "Home" },
    { id: "location", label: "Location" },
    { 
      id: "profile", 
      label: userRole === "customer" ? "Cart" : "Profile" 
    },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-soft z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "text-blue-600 scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
              )}
            >
              <img
                src="/leaf-icon.svg"
                alt="AgriLink Leaf"
                className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive && "drop-shadow-sm"
                )}
              />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 bg-blue-600 rounded-full animate-glow-pulse" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}