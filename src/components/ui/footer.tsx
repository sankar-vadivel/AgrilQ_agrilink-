import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Leaf, Facebook, Twitter, Instagram, Youtube } from "lucide-react"

const footerLinks = {
  company: [
    { name: "About Us", href: "#about" },
    { name: "Our Mission", href: "#mission" },
    { name: "Careers", href: "#careers" },
    { name: "Press Kit", href: "#press" },
    { name: "Blog", href: "#blog" }
  ],
  support: [
    { name: "Help Center", href: "#help" },
    { name: "FAQ", href: "#faq" },
    { name: "Shipping Info", href: "#shipping" },
    { name: "Returns", href: "#returns" }
  ],
  farmers: [
    { name: "Join as Farmer", href: "#join-farmer" },
    { name: "Farmer Guide", href: "#farmer-guide" },
    { name: "Verification", href: "#verification" },
    { name: "Pricing", href: "#pricing" },
    { name: "Resources", href: "#resources" }
  ],
  legal: [
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Terms of Service", href: "#terms" },
    { name: "Cookie Policy", href: "#cookies" },
    { name: "Quality Standards", href: "#quality" },
    { name: "Refund Policy", href: "#refund" }
  ]
}


const socialLinks = [
  { icon: Facebook, href: "#facebook", label: "Facebook" },
  { icon: Twitter, href: "#twitter", label: "Twitter" },
  { icon: Instagram, href: "#instagram", label: "Instagram" },
  { icon: Youtube, href: "#youtube", label: "YouTube" }
]

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold gradient-text">AgriLink</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Connecting farmers directly with consumers for fresh, traceable, 
              and sustainable produce. Building a transparent agricultural ecosystem.
            </p>
            
            {/* Newsletter Signup */}
            <div className="space-y-4">
              <h4 className="font-semibold">Stay Updated</h4>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter your email" 
                  className="flex-1"
                  type="email"
                />
                <Button className="btn-primary-glow">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get fresh updates about new farmers, seasonal produce, and exclusive offers.
              </p>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Farmers</h4>
            <ul className="space-y-2">
              {footerLinks.farmers.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Social Links */}
        <div className="mb-8">
          <h4 className="font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon
              return (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                >
                  <Icon className="w-5 h-5" />
                </a>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Join our community for daily updates, farming tips, and exclusive offers.
          </p>
        </div>

        <Separator className="mb-6" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AgriLink. All rights reserved. 
            <span className="ml-2">Made with ❤️ for farmers and consumers.</span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>🌱 Carbon Neutral Delivery</span>
            <span>•</span>
            <span>🔒 Secure Payments</span>
            <span>•</span>
            <span>✅ Quality Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  )
}