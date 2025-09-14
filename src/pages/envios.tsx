import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Truck, RotateCcw, Clock, AlertCircle, CheckCircle, Package, Shield, RefreshCw } from "lucide-react";

const Envios = () => {
  const shippingOptions = [
    {
      icon: Truck,
      title: "Envío Nacional",
      time: "3-5 días hábiles",
      cost: "Gratuito en compras mayores a $50",
      description: "Envío estándar a nivel nacional con seguimiento incluido",
      color: "text-blue-600"
    },
    {
      icon: Package,
      title: "Envío Express",
      time: "1-2 días hábiles",
      cost: "Costo adicional según destino",
      description: "Entrega rápida para ocasiones especiales",
      color: "text-purple-600"
    },
    {
      icon: Shield,
      title: "Envío Asegurado",
      time: "3-5 días hábiles",
      cost: "Incluido en pedidos mayores a $100",
      description: "Protección total durante el transporte",
      color: "text-green-600"
    }
  ];

  const returnPolicies = [
    {
      icon: Clock,
      title: "Plazo de Cambio",
      description: "Tienes 7 días calendario desde la fecha de compra para solicitar un cambio",
      highlight: "7 días"
    },
    {
      icon: RefreshCw,
      title: "Solo Un Cambio",
      description: "Se permite realizar únicamente un cambio por producto adquirido",
      highlight: "1 cambio"
    },
    {
      icon: AlertCircle,
      title: "No Devoluciones",
      description: "No aceptamos devoluciones, excepto por defectos de fábrica comprobados",
      highlight: "Solo defectos"
    }
  ];

  const processSteps = [
    {
      step: "1",
      title: "Contacta con Nosotros",
      description: "Escríbenos a cambios@lunatique.com dentro de los primeros 7 días con tu número de pedido y motivo del cambio."
    },
    {
      step: "2",
      title: "Evaluación",
      description: "Revisaremos tu solicitud y te confirmaremos si cumple con nuestras políticas de cambio."
    },
    {
      step: "3",
      title: "Autorización",
      description: "Si es aprobado, te enviaremos las instrucciones y etiqueta de envío para devolver el producto."
    },
    {
      step: "4",
      title: "Inspección",
      description: "Verificamos que el producto esté en condiciones originales antes de procesar el cambio."
    },
    {
      step: "5",
      title: "Nuevo Envío",
      description: "Te enviamos el producto de reemplazo sin costo adicional de envío."
    }
  ];

  const conditions = [
    "El producto debe estar en su empaque original",
    "No debe mostrar signos de uso o desgaste",
    "Debe incluir todos los accesorios originales",
    "La joya debe estar en perfectas condiciones",
    "Se requiere comprobante de compra original"
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-sage/10 to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <Truck className="h-8 w-8 text-luxury mr-2" />
              <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-foreground">
                Envíos y Devoluciones
              </h1>
              <RotateCcw className="h-8 w-8 text-luxury ml-2" />
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Información completa sobre nuestras políticas de envío, cambios y devoluciones
            </p>
            <Badge className="bg-luxury text-luxury-foreground text-lg px-6 py-2">
              Envío gratuito en compras mayores a $50
            </Badge>
          </div>
        </section>

        {/* Shipping Options Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Opciones de Envío
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Elige la opción de envío que mejor se adapte a tus necesidades
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {shippingOptions.map((option, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <option.icon className={`h-8 w-8 ${option.color}`} />
                      </div>
                    </div>
                    <h3 className="font-playfair text-xl font-semibold mb-2">
                      {option.title}
                    </h3>
                    <Badge variant="outline" className="mb-4">
                      {option.time}
                    </Badge>
                    <p className="text-sm font-medium text-primary mb-3">
                      {option.cost}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {option.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Shipping Details */}
            <Card className="bg-cream/30">
              <CardContent className="p-8">
                <h3 className="font-playfair text-xl font-semibold mb-6">
                  Detalles de Envío
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Procesamiento de Pedidos:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Los pedidos se procesan en 1-2 días hábiles</li>
                      <li>• Recibirás confirmación por email</li>
                      <li>• Número de seguimiento incluido</li>
                      <li>• Empaque seguro y elegante</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Cobertura:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Envíos a nivel nacional</li>
                      <li>• Entrega en domicilio</li>
                      <li>• Puntos de recogida disponibles</li>
                      <li>• Seguimiento en tiempo real</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Return Policy Section */}
        <section className="py-20 bg-sage/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Política de Cambios
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Conoce nuestras políticas de cambio para tener una experiencia de compra transparente
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {returnPolicies.map((policy, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <policy.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-playfair text-xl font-semibold mb-4">
                      {policy.title}
                    </h3>
                    <Badge className="mb-4 bg-luxury text-luxury-foreground">
                      {policy.highlight}
                    </Badge>
                    <p className="text-muted-foreground leading-relaxed">
                      {policy.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Important Notice */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-orange-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-orange-800 mb-2">
                      Política de Devoluciones
                    </h3>
                    <p className="text-orange-700 text-sm leading-relaxed">
                      <strong>No aceptamos devoluciones de dinero.</strong> Solo realizamos cambios por otro producto 
                      de igual o mayor valor. Las devoluciones únicamente se procesan en casos de defectos de fábrica 
                      comprobados por nuestro equipo técnico.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Proceso de Cambio
              </h2>
              <p className="text-lg text-muted-foreground">
                Pasos para solicitar un cambio de producto
              </p>
            </div>

            <div className="space-y-8">
              {processSteps.map((process, index) => (
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

        <Separator />

        {/* Conditions Section */}
        <section className="py-20 bg-cream/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Condiciones para Cambios
              </h2>
              <p className="text-lg text-muted-foreground">
                Requisitos que debe cumplir el producto para ser elegible para cambio
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Condiciones Requeridas
                    </h3>
                    <ul className="space-y-3">
                      {conditions.map((condition, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center">
                      <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                      No Elegible para Cambio
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                        Productos con signos de uso o desgaste
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                        Joyas dañadas por mal uso
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                        Productos modificados por terceros
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                        Cambios solicitados después de 7 días
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
              ¿Necesitas Ayuda con tu Pedido?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Nuestro equipo está listo para ayudarte con cualquier consulta sobre envíos o cambios
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Email de Envíos</h3>
                  <p className="text-muted-foreground text-sm">envios@lunatique.com</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Email de Cambios</h3>
                  <p className="text-muted-foreground text-sm">cambios@lunatique.com</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Tiempo de Respuesta</h3>
                  <p className="text-muted-foreground text-sm">24-48 horas</p>
                </CardContent>
              </Card>
            </div>
            <Button size="lg" onClick={() => window.location.href = '/contactanos'}>
              Contactar Atención al Cliente
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Envios;