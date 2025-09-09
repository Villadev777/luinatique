import { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Send,
  Instagram,
  Facebook,
  Twitter,
  Star
} from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Mensaje enviado",
      description: "Gracias por contactarnos. Te responderemos pronto.",
    });

    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Dirección",
      details: ["Av. Principal 123", "Lima, Perú 15001"],
      action: "Ver en mapa"
    },
    {
      icon: Phone,
      title: "Teléfono",
      details: ["+51 1 234-5678", "+51 987-654-321"],
      action: "Llamar ahora"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["hola@lunatique.com", "ventas@lunatique.com"],
      action: "Enviar email"
    },
    {
      icon: Clock,
      title: "Horarios",
      details: ["Lun - Vie: 9:00 - 18:00", "Sáb: 10:00 - 16:00"],
      action: "Ver horarios"
    }
  ];

  const socialLinks = [
    { icon: Instagram, name: "Instagram", handle: "@lunatique_jewelry", followers: "12.5K" },
    { icon: Facebook, name: "Facebook", handle: "Lunatiquê Jewelry", followers: "8.2K" },
    { icon: Twitter, name: "Twitter", handle: "@lunatique_pe", followers: "3.1K" }
  ];

  const faqs = [
    {
      question: "¿Ofrecen garantía en sus productos?",
      answer: "Sí, todos nuestros productos tienen garantía de 1 año contra defectos de fabricación."
    },
    {
      question: "¿Realizan envíos a todo el país?",
      answer: "Realizamos envíos a todo Perú. El envío es gratuito para compras mayores a S/200."
    },
    {
      question: "¿Puedo personalizar una joya?",
      answer: "¡Por supuesto! Ofrecemos servicios de personalización. Contáctanos para más detalles."
    },
    {
      question: "¿Cómo cuido mis joyas?",
      answer: "Te enviamos instrucciones de cuidado con cada compra. También puedes consultar nuestro journal."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-sage/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <MessageCircle className="h-8 w-8 text-primary mr-2" />
              <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-foreground">
                Contáctanos
              </h1>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Estamos aquí para ayudarte. Ponte en contacto con nosotros para cualquier consulta, 
              personalización o simplemente para conversar sobre joyas.
            </p>
            <Badge className="bg-primary text-primary-foreground text-lg px-6 py-2">
              Respuesta en menos de 24 horas
            </Badge>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Envíanos un mensaje
                    </CardTitle>
                    <CardDescription>
                      Completa el formulario y te responderemos lo antes posible
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-2">
                            Nombre completo *
                          </label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Email *
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="tu@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-2">
                          Asunto *
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          placeholder="¿En qué podemos ayudarte?"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-2">
                          Mensaje *
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          placeholder="Cuéntanos más detalles..."
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar mensaje
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-playfair text-2xl font-semibold mb-6">
                    Información de contacto
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {contactInfo.map((info, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <info.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">{info.title}</h3>
                              {info.details.map((detail, idx) => (
                                <p key={idx} className="text-sm text-muted-foreground">
                                  {detail}
                                </p>
                              ))}
                              <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                                {info.action}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="font-playfair text-xl font-semibold mb-4">
                    Síguenos en redes sociales
                  </h3>
                  <div className="space-y-3">
                    {socialLinks.map((social, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow duration-300 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <social.icon className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{social.name}</p>
                                <p className="text-sm text-muted-foreground">{social.handle}</p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {social.followers} seguidores
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* FAQ Section */}
        <section className="py-20 bg-cream/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl font-semibold mb-4">
                Preguntas Frecuentes
              </h2>
              <p className="text-muted-foreground">
                Encuentra respuestas rápidas a las consultas más comunes
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3 flex items-start gap-2">
                      <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed ml-6">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                ¿No encontraste lo que buscabas?
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/journal'}>
                Visita nuestro Journal
              </Button>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl font-semibold mb-4">
                Visítanos
              </h2>
              <p className="text-muted-foreground">
                Te esperamos en nuestro showroom para que puedas ver y tocar nuestras creaciones
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Mapa interactivo próximamente
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Av. Principal 123, Lima, Perú
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;