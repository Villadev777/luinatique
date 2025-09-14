import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, AlertTriangle, Heart, Sparkles, Clock, CheckCircle } from "lucide-react";

const Garantia = () => {
  const careInstructions = [
    {
      icon: AlertTriangle,
      title: "Evita Fricciones Fuertes",
      description: "Recuerda que nuestras cuentas miyuki son de vidrio y todos nuestros productos son hechos artesanalmente. Manipúlalos con delicadeza.",
      color: "text-orange-600"
    },
    {
      icon: Shield,
      title: "Sin Contacto con Químicos",
      description: "Evita el contacto con químicos que pueden afectar el color o brillo de las piedras, hilos o telas de tu joya.",
      color: "text-red-600"
    },
    {
      icon: Heart,
      title: "Manejo Cuidadoso",
      description: "No golpees bruscamente tu joya, ni la rocíes con cremas, jabones, colonias o perfumes.",
      color: "text-rose-600"
    }
  ];

  const coverageItems = [
    "Defectos de fabricación",
    "Problemas con materiales",
    "Fallas en el engarzado",
    "Deterioro prematuro por uso normal"
  ];

  const notCoveredItems = [
    "Daños por mal uso o negligencia",
    "Exposición a químicos",
    "Golpes o caídas accidentales",
    "Desgaste normal por uso prolongado",
    "Modificaciones realizadas por terceros"
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
                Garantía
              </h1>
              <Shield className="h-8 w-8 text-luxury ml-2" />
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Protegemos la calidad y artesanía de cada pieza Lunatiquê con nuestra garantía integral
            </p>
            <Badge className="bg-luxury text-luxury-foreground text-lg px-6 py-2">
              Garantía de por vida en todas nuestras creaciones
            </Badge>
          </div>
        </section>

        {/* Care Instructions Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Cuidados Esenciales
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Para mantener la belleza y durabilidad de tus joyas Lunatiquê, sigue estas recomendaciones importantes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {careInstructions.map((instruction, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <instruction.icon className={`h-8 w-8 ${instruction.color}`} />
                      </div>
                    </div>
                    <h3 className="font-playfair text-xl font-semibold mb-4">
                      {instruction.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {instruction.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Care Tips */}
            <Card className="bg-cream/30">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Sparkles className="h-6 w-6 text-luxury mr-2" />
                  <h3 className="font-playfair text-xl font-semibold">
                    Consejos Adicionales de Cuidado
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Almacenamiento:</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Guarda tus joyas en un lugar seco, preferiblemente en su caja original o en compartimentos separados para evitar rayones.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Limpieza:</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Utiliza un paño suave y seco para limpiar suavemente. Para limpieza profunda, consulta con nuestro equipo de atención al cliente.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Uso Diario:</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Ponte las joyas después de aplicar maquillaje, perfume o cremas. Retíralas antes de hacer ejercicio o actividades físicas intensas.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Inspección:</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Revisa periódicamente tus joyas en busca de signos de desgaste. Contáctanos si notas algún problema.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Warranty Coverage Section */}
        <section className="py-20 bg-sage/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Cobertura de Garantía
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Conoce qué está incluido y qué no está cubierto por nuestra garantía
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* What's Covered */}
              <Card className="h-fit">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="font-playfair text-xl font-semibold">
                      Qué Está Cubierto
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {coverageItems.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Garantía de por vida:</strong> Reparamos o reemplazamos sin costo cualquier defecto de fabricación.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* What's Not Covered */}
              <Card className="h-fit">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
                    <h3 className="font-playfair text-xl font-semibold">
                      Qué No Está Cubierto
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {notCoveredItems.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Nota:</strong> Ofrecemos servicios de reparación para daños no cubiertos por la garantía con costo adicional.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Proceso de Garantía
              </h2>
              <p className="text-lg text-muted-foreground">
                Pasos simples para hacer uso de tu garantía Lunatiquê
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Contacto Inicial",
                  description: "Escríbenos a garantia@lunatique.com o llámanos. Describe el problema y adjunta fotos de la joya."
                },
                {
                  step: "2", 
                  title: "Evaluación",
                  description: "Nuestro equipo evaluará el caso y te confirmará si está cubierto por la garantía en un plazo de 48 horas."
                },
                {
                  step: "3",
                  title: "Envío",
                  description: "Si está cubierto, te proporcionaremos una etiqueta de envío gratuita para que nos envíes la pieza."
                },
                {
                  step: "4",
                  title: "Reparación o Reemplazo",
                  description: "Repararemos o reemplazaremos tu joya según sea necesario, manteniendo la calidad original."
                },
                {
                  step: "5",
                  title: "Devolución",
                  description: "Te enviaremos tu joya reparada o nueva sin costo adicional, con envío asegurado."
                }
              ].map((process, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">
                        {process.step}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-playfair text-xl font-semibold mb-2">
                      {process.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {process.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-cream/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <Clock className="h-6 w-6 text-luxury mr-2" />
              <h2 className="font-playfair text-2xl md:text-3xl font-semibold">
                ¿Necesitas Ayuda con tu Garantía?
              </h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              Nuestro equipo está aquí para ayudarte con cualquier consulta sobre garantía
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Email de Garantía</h3>
                  <p className="text-muted-foreground">garantia@lunatique.com</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Tiempo de Respuesta</h3>
                  <p className="text-muted-foreground">24-48 horas</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Garantia;