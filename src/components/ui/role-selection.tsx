import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Tractor } from "lucide-react"

interface RoleSelectionProps {
  onRoleSelect: (role: "farmer" | "customer") => void
}

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-2 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Welcome to AgriLink</h1>
        <p className="text-muted-foreground">
          Direct farm-to-table marketplace connecting farmers and customers
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <Card 
          className="animated-border cursor-pointer group hover:scale-105 animate-slide-up"
          style={{ animationDelay: "200ms" }}
          onClick={() => onRoleSelect("farmer")}
        >
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors duration-300">
              <img 
                src="/assets/farmer-icon.png" 
                alt="Farmer" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <CardTitle className="text-xl group-hover:text-secondary transition-colors duration-200">
              I'm a Farmer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Sell your fresh produce directly to customers
            </p>
            <Button 
              variant="outline" 
              className="w-full group-hover:bg-secondary group-hover:text-secondary-foreground group-hover:border-secondary transition-all duration-200"
            >
              <Tractor className="w-4 h-4 mr-2" />
              Continue as Farmer
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="animated-border cursor-pointer group hover:scale-105 animate-slide-up"
          style={{ animationDelay: "400ms" }}
          onClick={() => onRoleSelect("customer")}
        >
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-300">
              <img 
                src="/assets/customer-icon.png" 
                alt="Customer" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <CardTitle className="text-xl group-hover:text-primary transition-colors duration-200">
              I'm a Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Buy fresh, traceable produce from local farmers
            </p>
            <Button 
              variant="outline"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200"
            >
              <Users className="w-4 h-4 mr-2" />
              Continue as Customer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}