import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Image, Mail } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Tienda",
      links: [
        { name: "Nuevos Arrivals", href: "/shop?filter=new" },
        { name: "Anillos", href: "/shop/anillos" },
        { name: "Collares", href: "/shop/collares" },
        { name: "Aretes", href: "/shop/aretes" },
        { name: "Pulseras", href: "/shop/pulseras" },
        { name: "Ofertas", href: "/sale" }
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
        { name: "Guía de Tallas", href: "/contactanos#size-guide" },
        { name: "Garantía y Cuidado", href: "/garantia" },
        { name: "Política de devoluciones", href: "/envios" },
        { name: "Política de privacidad", href: "/privacidad" },
        { name: "Preguntas Frecuentes", href: "/contactanos#faq" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/lunatiqueshop/?hl=es-la", label: "Instagram" },
    { icon: Facebook, href: "https://www.facebook.com/lunatiqueshopperu/?locale=es_LA", label: "Facebook" },
    { icon: Image, href: "#pinterest", label: "Pinterest" },
    { icon: Mail, href: "mailto:contact@lunatique.shop", label: "Correo" }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <h3 className="font-playfair text-2xl font-semibold mb-4">
                LUNATIQUÊ
              </h3>
              <p className="text-primary-foreground/80 leading-relaxed mb-6 text-sm">
                Creando piezas únicas desde 2010. Joyería artesanal hecha con amor.
              </p>
              
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <Button
                    key={social.label}
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all"
                    asChild
                  >
                    <a 
                      href={social.href} 
                      aria-label={social.label}
                      target={social.href.startsWith('http') ? '_blank' : undefined}
                      rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      <social.icon className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-primary-foreground mb-4 tracking-wide text-sm">
                  {section.title.toUpperCase()}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 text-sm block"
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
        <div className="border-t border-primary-foreground/20 py-6 md:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-primary-foreground/60 text-xs md:text-sm">
              © {new Date().getFullYear()} Lunatiquê. Todos los derechos reservados.
            </div>
            
            <div className="flex flex-wrap justify-center space-x-4 md:space-x-6 text-xs md:text-sm">
              <a 
                href="/privacidad" 
                className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                Política de Privacidad
              </a>
              <a 
                href="/envios" 
                className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                Términos de Servicio
              </a>
              <a 
                href="/contactanos" 
                className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
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