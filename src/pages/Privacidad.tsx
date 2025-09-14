import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, UserCheck, FileText, Database, AlertCircle, CheckCircle } from "lucide-react";

const Privacidad = () => {
  const dataTypes = [
    {
      icon: UserCheck,
      title: "Información Personal",
      items: ["Nombre completo", "Dirección de correo electrónico", "Número de teléfono", "Dirección de entrega"]
    },
    {
      icon: Database,
      title: "Información de Compra",
      items: ["Historial de pedidos", "Preferencias de productos", "Métodos de pago", "Direcciones de facturación"]
    },
    {
      icon: Eye,
      title: "Información de Navegación",
      items: ["Dirección IP", "Tipo de navegador", "Páginas visitadas", "Tiempo de permanencia"]
    }
  ];

  const userRights = [
    {
      title: "Derecho de Acceso",
      description: "Solicitar información sobre qué datos personales tenemos sobre ti y cómo los utilizamos."
    },
    {
      title: "Derecho de Rectificación",
      description: "Corregir datos personales inexactos o incompletos que tengamos en nuestros registros."
    },
    {
      title: "Derecho de Cancelación",
      description: "Solicitar la eliminación de tus datos personales de nuestras bases de datos."
    },
    {
      title: "Derecho de Oposición",
      description: "Oponerte al tratamiento de tus datos para fines específicos como marketing directo."
    }
  ];

  const securityMeasures = [
    "Encriptación SSL en todas las transacciones",
    "Servidores seguros con acceso restringido",
    "Protocolos de autenticación avanzados",
    "Copias de seguridad regulares y cifradas",
    "Monitoreo constante de seguridad",
    "Capacitación continua del personal"
  ];

  const cookieTypes = [
    {
      type: "Cookies Esenciales",
      purpose: "Necesarias para el funcionamiento básico del sitio web",
      required: true
    },
    {
      type: "Cookies de Rendimiento",
      purpose: "Nos ayudan a entender cómo los usuarios interactúan con nuestro sitio",
      required: false
    },
    {
      type: "Cookies de Marketing",
      purpose: "Utilizadas para mostrar publicidad relevante y personalizada",
      required: false
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-sage/10 to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-luxury mr-2" />
              <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-foreground">
                Política de Privacidad
              </h1>
              <Lock className="h-8 w-8 text-luxury ml-2" />
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Tu privacidad es nuestra prioridad. Conoce cómo protegemos y utilizamos tu información personal
            </p>
            <Badge className="bg-luxury text-luxury-foreground text-lg px-6 py-2">
              Cumplimos con la Ley 29733 de Protección de Datos Personales
            </Badge>
          </div>
        </section>

        {/* Legal Framework Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-cream/30">
              <CardContent className="p-8">
                <div className="flex items-start mb-6">
                  <FileText className="h-6 w-6 text-luxury mr-3 mt-1" />
                  <div>
                    <h2 className="font-playfair text-2xl font-semibold mb-4">
                      Marco Legal
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      La protección de información de los usuarios es muy importante, por ello son protegidos 
                      por la normativa vigente de <strong>Ley 29733 (Ley de Protección de Datos Personales y su Reglamento)</strong> 
                      y el <strong>Decreto Supremo 003-2013-JUS</strong>.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      La presente política de privacidad establece los términos en que Lunatiquê protege la 
                      información que es proporcionada por sus usuarios al momento de utilizar el sitio web. 
                      Por lo tanto, Lunatiquê asume un compromiso permanente en la forma en la que trata y 
                      conserva los datos personales de los usuarios.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Data Collection Section */}
        <section className="py-20 bg-sage/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Información que Recopilamos
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Conoce qué tipos de información recopilamos y cómo la utilizamos para mejorar tu experiencia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {dataTypes.map((dataType, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <dataType.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-playfair text-xl font-semibold mb-4 text-center">
                      {dataType.title}
                    </h3>
                    <ul className="space-y-2">
                      {dataType.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Purpose Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Finalidad del Tratamiento
              </h2>
              <p className="text-lg text-muted-foreground">
                Utilizamos tu información personal únicamente para los siguientes propósitos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Procesamiento de Pedidos",
                  description: "Gestionar tus compras, envíos y comunicaciones relacionadas con tus pedidos."
                },
                {
                  title: "Atención al Cliente",
                  description: "Proporcionar soporte técnico, resolver consultas y mejorar nuestros servicios."
                },
                {
                  title: "Marketing Personalizado",
                  description: "Enviar ofertas, promociones y contenido relevante según tus preferencias (opcional)."
                },
                {
                  title: "Mejora del Sitio Web",
                  description: "Analizar el uso del sitio para optimizar la experiencia del usuario y funcionalidad."
                },
                {
                  title: "Cumplimiento Legal",
                  description: "Cumplir con obligaciones legales, regulatorias y de auditoría cuando sea requerido."
                },
                {
                  title: "Prevención de Fraude",
                  description: "Detectar y prevenir actividades fraudulentas para proteger a todos nuestros usuarios."
                }
              ].map((purpose, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{purpose.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {purpose.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* User Rights Section */}
        <section className="py-20 bg-cream/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Tus Derechos ARCO
              </h2>
              <p className="text-lg text-muted-foreground">
                Como titular de datos personales, tienes los siguientes derechos garantizados por ley
              </p>
            </div>

            <div className="space-y-6">
              {userRights.map((right, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-4 mt-1">
                        <span className="text-primary-foreground font-bold text-sm">
                          {right.title.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{right.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {right.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-8 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">
                      Ejercicio de Derechos
                    </h3>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      Para ejercer cualquiera de estos derechos, envía un correo a <strong>privacidad@lunatique.com</strong> 
                      con tu solicitud detallada y una copia de tu documento de identidad. Responderemos en un plazo 
                      máximo de 10 días hábiles según lo establecido por la ley.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Medidas de Seguridad
              </h2>
              <p className="text-lg text-muted-foreground">
                Implementamos múltiples capas de seguridad para proteger tu información personal
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Lock className="h-5 w-5 text-green-600 mr-2" />
                      Medidas Técnicas
                    </h3>
                    <ul className="space-y-3">
                      {securityMeasures.slice(0, 3).map((measure, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{measure}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Shield className="h-5 w-5 text-blue-600 mr-2" />
                      Medidas Organizacionales
                    </h3>
                    <ul className="space-y-3">
                      {securityMeasures.slice(3).map((measure, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <CheckCircle className="h-4 w-4 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{measure}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cookies Section */}
        <section className="py-20 bg-sage/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Política de Cookies
              </h2>
              <p className="text-lg text-muted-foreground">
                Información sobre el uso de cookies en nuestro sitio web
              </p>
            </div>

            <div className="space-y-6">
              {cookieTypes.map((cookie, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{cookie.type}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {cookie.purpose}
                        </p>
                      </div>
                      <Badge variant={cookie.required ? "default" : "outline"} className="ml-4">
                        {cookie.required ? "Requerido" : "Opcional"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Gestión de Cookies</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Puedes gestionar tus preferencias de cookies a través de la configuración de tu navegador. 
                  Ten en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad del sitio web.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Badge variant="outline">Configuración del navegador</Badge>
                  <Badge variant="outline">Panel de preferencias</Badge>
                  <Badge variant="outline">Eliminar cookies existentes</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
              Contacto para Privacidad
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Si tienes preguntas sobre esta política de privacidad o el tratamiento de tus datos personales
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Email de Privacidad</h3>
                  <p className="text-muted-foreground">privacidad@lunatique.com</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Tiempo de Respuesta</h3>
                  <p className="text-muted-foreground">Máximo 10 días hábiles</p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-8">
              <p className="text-sm text-muted-foreground">
                Última actualización: Enero 2024 | Esta política puede ser actualizada periódicamente
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacidad;