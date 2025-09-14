import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Image, Mail } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Tienda",
      links: [
        { name: "Nuevos Arrivals", href: "/shop" },
        { name: "Anillos", href: "/shop" },
        { name: "Collares", href: "/shop" },
        { name: "Aretes", href: "/shop" },
        { name: "Pulseras", href: "/shop" },
        { name: "Ofertas", href: "/shop" }
      ]
    },
    {
      title: "Nosotros",
      links: [
        { name: "Nuestra Historia", href: "/story" },
        { name: "Artesanía", href: "/story" },
        { name: "Sostenibilidad", href: "/story" },
        { name: "Blog", href: "/journal" }
      ]
    },
    {
      title: "Atención al Cliente",
      links: [
        { name: "Contáctanos", href: "/contactanos" },
        { name: "Guía de Tallas", href: "#size-guide" },
        { name: "Instrucciones de Cuidado", href: "#care" },
        { name: "Envíos y Devoluciones", href: "#shipping" },
        { name: "Preguntas Frecuentes", href: "#faq" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: "#instagram", label: "Instagram" },
    { icon: Facebook, href: "#facebook", label: "Facebook" },
    { icon: Image, href: "#pinterest", label: "Pinterest" },
    { icon: Mail, href: "#email", label: "Correo" }
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
                LUNATIQUÊ
              </h3>
              <p className="text-primary-foreground/80 leading-relaxed mb-6">
                Creando piezas únicas desde 2010.
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
              © 2024 Lunatiquê. Todos los derechos reservados.
            </div>
            
            <div className="flex space-x-6 text-sm">
              <a href="#privacy" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Política de Privacidad
              </a>
              <a href="#terms" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Términos de Servicio
              </a>
              <a href="#accessibility" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Accesibilidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;