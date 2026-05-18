import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Clock, Shield, Microscope, Award } from "lucide-react"

interface VerificationLevel {
  id: string
  name: string
  icon: typeof CheckCircle
  color: string
  bgColor: string
  description: string
  features: string[]
  confidence: number
}

const verificationLevels: VerificationLevel[] = [
  {
    id: "organic",
    name: "Certified Organic",
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10 border-success/20",
    description: "Highest quality standard with official organic certification",
    features: [
      "Zero synthetic pesticides",
      "No chemical fertilizers",
      "Soil health certified",
      "Third-party verified",
      "Traceability guaranteed"
    ],
    confidence: 98
  },
  {
    id: "residue-free",
    name: "Residue-Free",
    icon: Shield,
    color: "text-secondary",
    bgColor: "bg-secondary/10 border-secondary/20",
    description: "Lab-tested to ensure no harmful residues present",
    features: [
      "Lab-tested quality",
      "No harmful residues",
      "Safe consumption",
      "Regular monitoring",
      "Quality assured"
    ],
    confidence: 92
  },
  {
    id: "conventional",
    name: "Conventional",
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10 border-warning/20",
    description: "Standard farming practices with quality monitoring",
    features: [
      "Standard farming",
      "Quality monitored",
      "Market compliant",
      "Basic testing",
      "Affordable pricing"
    ],
    confidence: 85
  }
]

export function VerificationSystem() {
  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 fade-slide-up">
          <h2 className="text-4xl font-bold mb-4">Verification System</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our three-tier verification system ensures you know exactly what you're buying. 
            From certified organic to quality-tested conventional produce.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {verificationLevels.map((level, index) => {
            const Icon = level.icon
            return (
              <Card 
                key={level.id} 
                className="card-premium hover:shadow-lift transition-all duration-300 hover:-translate-y-2 fade-slide-up h-full"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8 h-full flex flex-col">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${level.bgColor} mb-4`}>
                      <Icon className={`w-8 h-8 ${level.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{level.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {level.description}
                    </p>
                  </div>

                  {/* Confidence Score */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Quality Score:</span>
                      <span className={`text-lg font-bold ${level.color}`}>{level.confidence}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          level.id === "organic" ? "bg-success" :
                          level.id === "residue-free" ? "bg-secondary" : "bg-warning"
                        }`}
                        style={{ width: `${level.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1">
                    <h4 className="font-medium mb-3 text-sm">Key Features:</h4>
                    <ul className="space-y-2">
                      {level.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-sm">
                          <CheckCircle className="w-3 h-3 text-success mr-2 mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Badge */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <Badge className={`w-full justify-center ${level.bgColor} ${level.color}`}>
                      Verified by AgriLink
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Verification Process */}
        <div className="fade-slide-up" style={{ animationDelay: '0.8s' }}>
          <Card className="card-premium shadow-lift">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold mb-8 text-center">Our Verification Process</h3>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
                    <Microscope className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Testing</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced analysis for contaminants and quality
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-4 mx-auto">
                    <Shield className="w-6 h-6 text-secondary" />
                  </div>
                  <h4 className="font-semibold mb-2">Field Inspection</h4>
                  <p className="text-sm text-muted-foreground">
                    On-site verification of farming practices and conditions
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4 mx-auto">
                    <Award className="w-6 h-6 text-accent" />
                  </div>
                  <h4 className="font-semibold mb-2">Certification</h4>
                  <p className="text-sm text-muted-foreground">
                    Third-party certification from recognized authorities
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Final quality verification and digital certification
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}