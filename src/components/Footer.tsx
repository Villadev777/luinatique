import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Image, Mail } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Shop",
      links: [
        { name: "New Arrivals", href: "/shop" },
        { name: "Rings", href: "/shop" },
        { name: "Necklaces", href: "/shop" },
        { name: "Earrings", href: "/shop" },
        { name: "Bracelets", href: "/shop" },
        { name: "Sale", href: "/shop" }
      ]
    },
    {
      title: "About",
      links: [
        { name: "Our Story", href: "/story" },
        { name: "Craftsmanship", href: "/story" },
        { name: "Sustainability", href: "/story" },
        { name: "Journal", href: "/journal" }
      ]
    },
    {
      title: "Customer Care",
      links: [
        { name: "Contact Us", href: "#contact" },
        { name: "Size Guide", href: "#size-guide" },
        { name: "Care Instructions", href: "#care" },
        { name: "Shipping & Returns", href: "#shipping" },
        { name: "FAQ", href: "#faq" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: "#instagram", label: "Instagram" },
    { icon: Facebook, href: "#facebook", label: "Facebook" },
    { icon: Image, href: "#pinterest", label: "Pinterest" },
    { icon: Mail, href: "#email", label: "Email" }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <h3 className="font-playfair text-2xl font-semibold mb-4">
                Lunatiquê
              </h3>
              <p className="text-primary-foreground/80 leading-relaxed mb-6">
                Crafting timeless jewelry pieces that celebrate life's most precious moments.
              </p>
              
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <Button
                    key={social.label}
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    asChild
                  >
                    <a href={social.href} aria-label={social.label}>
                      <social.icon className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-primary-foreground mb-4 tracking-wide">
                  {section.title.toUpperCase()}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/20 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-primary-foreground/60 text-sm">
              © 2024 Lunatiquê. All rights reserved.
            </div>
            
            <div className="flex space-x-6 text-sm">
              <a href="#privacy" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#accessibility" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;