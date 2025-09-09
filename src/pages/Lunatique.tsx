import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Heart, Sparkles, Award, Users, Globe } from "lucide-react";

const Lunatique = () => {
  const values = [
    {
      icon: Heart,
      title: "Pasión por la Excelencia",
      description: "Cada pieza es creada con amor y dedicación, reflejando nuestra pasión por la joyería de alta calidad."
    },
    {
      icon: Sparkles,
      title: "Diseño Innovador",
      description: "Combinamos técnicas tradicionales con diseños contemporáneos para crear piezas únicas y atemporales."
    },
    {
      icon: Award,
      title: "Calidad Garantizada",
      description: "Utilizamos solo los mejores materiales y ofrecemos garantía de por vida en todas nuestras creaciones."
    },
    {
      icon: Users,
      title: "Comunidad",
      description: "Más que clientes, formamos una comunidad de personas que aprecian la belleza y la elegancia."
    },
    {
      icon: Globe,
      title: "Sostenibilidad",
      description: "Comprometidos con prácticas éticas y sostenibles en toda nuestra cadena de producción."
    }
  ];

  const milestones = [
    {
      year: "2019",
      title: "Fundación",
      description: "Lunatiquê nace con la visión de crear joyas que capturen la belleza celestial."
    },
    {
      year: "2020",
      title: "Primera Colección",
      description: "Lanzamos nuestra primera colección 'Luna' con gran éxito entre nuestros clientes."
    },
    {
      year: "2021",
      title: "Expansión Digital",
      description: "Creamos nuestra plataforma online para llegar a más personas en todo el mundo."
    },
    {
      year: "2022",
      title: "Reconocimiento",
      description: "Recibimos el premio 'Mejor Diseño de Joyería Contemporánea' por nuestra innovación."
    },
    {
      year: "2023",
      title: "Sostenibilidad",
      description: "Implementamos prácticas 100% sostenibles en toda nuestra producción."
    },
    {
      year: "2024",
      title: "Comunidad Global",
      description: "Alcanzamos más de 10,000 clientes satisfechos en todo el mundo."
    }
  ];

  const team = [
    {
      name: "Isabella Martínez",
      role: "Fundadora & Diseñadora Principal",
      description: "Con más de 15 años de experiencia en joyería fina, Isabella es la mente creativa detrás de cada diseño de Lunatiquê.",
      image: "/placeholder.svg"
    },
    {
      name: "Carlos Rodríguez",
      role: "Maestro Joyero",
      description: "Artesano con 20 años de experiencia, Carlos da vida a cada diseño con técnicas tradicionales y modernas.",
      image: "/placeholder.svg"
    },
    {
      name: "Ana García",
      role: "Directora de Sostenibilidad",
      description: "Ana lidera nuestros esfuerzos para mantener prácticas éticas y sostenibles en toda la empresa.",
      image: "/placeholder.svg"
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
              <Star className="h-8 w-8 text-luxury mr-2" />
              <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-foreground">
                Lunatiquê
              </h1>
              <Star className="h-8 w-8 text-luxury ml-2" />
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Donde la elegancia celestial se encuentra con la artesanía excepcional. 
              Descubre la historia, valores y pasión que definen nuestra marca.
            </p>
            <Badge className="bg-luxury text-luxury-foreground text-lg px-6 py-2">
              Desde 2019 creando belleza atemporal
            </Badge>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                  Nuestra Misión
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  En Lunatiquê, creemos que cada joya debe contar una historia única. Nuestra misión es 
                  crear piezas excepcionales que no solo adornen, sino que también inspiren y conecten 
                  a las personas con la belleza infinita del universo.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Cada diseño nace de la fascinación por los cuerpos celestiales y se materializa 
                  a través de la maestría artesanal, utilizando solo los materiales más finos y 
                  técnicas tradicionales perfeccionadas a lo largo de generaciones.
                </p>
                <Button size="lg" onClick={() => window.location.href = '/story'}>
                  Conoce Nuestra Historia
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-sage/20 rounded-lg h-48"></div>
                  <div className="bg-luxury/20 rounded-lg h-32"></div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-luxury/20 rounded-lg h-32"></div>
                  <div className="bg-sage/20 rounded-lg h-48"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Values Section */}
        <section className="py-20 bg-cream/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Nuestros Valores
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Los principios que guían cada decisión y cada creación en Lunatiquê
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <value.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-playfair text-xl font-semibold mb-4">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Nuestro Camino
              </h2>
              <p className="text-lg text-muted-foreground">
                Los momentos más importantes en la historia de Lunatiquê
              </p>
            </div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">
                        {milestone.year}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-playfair text-xl font-semibold mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* Team Section */}
        <section className="py-20 bg-sage/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
                Nuestro Equipo
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Las personas apasionadas que hacen posible cada creación de Lunatiquê
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-6"></div>
                    <h3 className="font-playfair text-xl font-semibold mb-2">
                      {member.name}
                    </h3>
                    <Badge variant="outline" className="mb-4">
                      {member.role}
                    </Badge>
                    <p className="text-muted-foreground leading-relaxed">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
              Únete a Nuestra Historia
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Descubre nuestras colecciones y forma parte de la comunidad Lunatiquê
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => window.location.href = '/shop'}>
                Explorar Colecciones
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/journal'}>
                Leer Nuestro Journal
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Lunatique;