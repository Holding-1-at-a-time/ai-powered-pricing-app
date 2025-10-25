import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, Sparkles, TrendingUp, Shield, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-accent-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">AutoDetail Pro</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Services
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Dynamic Pricing
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 text-balance">
            Premium Auto Detailing, Intelligently Priced
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Experience professional auto detailing with transparent, AI-optimized pricing that adapts to your vehicle,
            schedule, and service needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8">
                Book Now
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="text-base px-8 bg-transparent">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-balance">
            Why Choose AutoDetail Pro
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Smart Pricing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI analyzes market trends, demand, and your vehicle specifics to offer fair, competitive pricing in
                real-time.
              </p>
            </div>
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Quality Guaranteed</h3>
              <p className="text-muted-foreground leading-relaxed">
                Professional detailers, premium products, and satisfaction guaranteed on every service we provide.
              </p>
            </div>
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Flexible Scheduling</h3>
              <p className="text-muted-foreground leading-relaxed">
                Book at your convenience with real-time availability and instant confirmation for all services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section id="services" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-balance">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From quick exterior washes to complete interior and exterior detailing packages
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Exterior Detail", price: "From $89", icon: "🚗" },
              { name: "Interior Detail", price: "From $129", icon: "🧼" },
              { name: "Full Detail", price: "From $199", icon: "✨" },
              { name: "Specialty Services", price: "Custom", icon: "🔧" },
            ].map((service) => (
              <div
                key={service.name}
                className="bg-card p-6 rounded-xl border border-border hover:border-accent transition-colors"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-display font-semibold mb-2">{service.name}</h3>
                <p className="text-accent font-semibold mb-4">{service.price}</p>
                <Link href="/book">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Learn More
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-primary text-primary-foreground rounded-2xl my-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-balance">
            Ready to Experience the Difference?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Get an instant AI-powered quote and book your detailing service in minutes
          </p>
          <Link href="/book">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8">
              Get Your Quote
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="font-display font-bold">AutoDetail Pro</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional auto detailing with intelligent pricing technology.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/services/exterior">Exterior Detail</Link>
                </li>
                <li>
                  <Link href="/services/interior">Interior Detail</Link>
                </li>
                <li>
                  <Link href="/services/full">Full Detail</Link>
                </li>
                <li>
                  <Link href="/services/specialty">Specialty</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/careers">Careers</Link>
                </li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 AutoDetail Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
