import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Leaf, UserCircle, LogOut, Receipt, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

import { AuthModal } from "@/components/auth/auth-modal"
import { ProfileModal } from "@/components/auth/profile-modal"
import { OrdersModal } from "@/components/ui/orders-modal"
import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export function Header({ activeSection, onSectionChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isOrdersOpen, setIsOrdersOpen] = useState(false)
  const { user, userRole, signOut } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const navigate = useNavigate()

  const allItems = [
    { id: "home", label: t("home") },
    { id: "categories", label: t("categories") },
    { id: "market-price", label: t("market_price") },
    { id: "verification", label: t("verification") },
    { id: "price-compare", label: t("price_compare") },
    { id: "dashboard", label: t("dashboard") },
    { id: "about", label: t("about") },
  ]

  const menuItems = allItems.filter(item => {
    if (!user) {
      return item.id === "home" || item.id === "about"
    }
    if (userRole === "customer") {
      return item.id === "home" || item.id === "market-price" || item.id === "price-compare" || item.id === "about"
    }
    return true // Farmer sees all
  })

  const handleMenuClick = (sectionId: string) => {
    onSectionChange?.(sectionId)
    setIsMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">AgriLink</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600 relative py-2",
                  activeSection === item.id
                    ? "text-blue-600"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
                {activeSection === item.id && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2" title={t("language")}>
                  <Globe className="w-5 h-5 text-muted-foreground mr-1" />
                  <span className="text-xs uppercase font-bold text-muted-foreground">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ta")}>தமிழ்</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("hi")}>हिन्दी</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsOrdersOpen(true)} title={t("orders")} className="text-foreground hover:bg-muted p-2">
                  <Receipt className="w-5 h-5" />
                </Button>
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2 hover:bg-muted/50 px-3 py-1.5 rounded-full transition-colors"
                >
                  {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                      <UserCircle className="w-6 h-6 text-foreground" />
                  )}
                  <span className="text-foreground font-bold">{user.displayName}</span>
                </button>
                <Button variant="ghost" size="sm" onClick={signOut} title={t("logout")} className="text-foreground hover:bg-muted p-2">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="pl-2">
                <AuthModal />
              </div>
            )}
            {!user && (
              <Button size="sm" className="btn-primary-glow" onClick={() => {
                const loginButton = document.querySelector('button[data-state="closed"]');
                if (loginButton instanceof HTMLElement) loginButton.click();
              }}>
                {t("get_started")}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={cn(
                  "block px-3 py-2 text-base font-medium transition-colors w-full text-left rounded-md",
                  activeSection === item.id
                    ? "text-blue-600 bg-blue-50"
                    : "text-muted-foreground hover:text-blue-600 hover:bg-muted/50"
                )}
              >
                {item.label}
              </button>
            ))}
            <div className="border-t border-border/50 pt-3 mt-3 space-y-2">
                {user ? (
                  <>
                    <button 
                      onClick={() => { setIsProfileOpen(true); setIsMenuOpen(false); }}
                      className="w-full px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border/50 mb-2 flex items-center gap-2 hover:bg-muted/50 transition-colors"
                    >
                      {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                          <UserCircle className="w-5 h-5 text-foreground" />
                      )}
                      Logged in as <span className="text-foreground font-bold">{user.displayName}</span>
                    </button>
                    <Button variant="outline" size="sm" className="w-full text-foreground mb-2" onClick={() => { setIsOrdersOpen(true); setIsMenuOpen(false); }}>
                      <Receipt className="w-4 h-4 mr-2" />
                      {t("orders")}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-foreground" onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("logout")}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <AuthModal />
                    <Button size="sm" className="w-full btn-primary-glow" onClick={() => {
                      const loginButton = document.querySelector('button[data-state="closed"]');
                      if (loginButton instanceof HTMLElement) loginButton.click();
                    }}>
                      {t("get_started")}
                    </Button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} setIsOpen={setIsProfileOpen} />
      
      {/* Orders/Receipts Modal */}
      <OrdersModal isOpen={isOrdersOpen} setIsOpen={setIsOrdersOpen} />
    </header>
  )
}