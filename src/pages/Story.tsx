import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Story = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-sage/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-foreground mb-8">
              Our Story
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Born from a fascination with the cosmos and a passion for timeless craftsmanship, 
              Lunatiquê celebrates the mystical beauty that surrounds us.
            </p>
          </div>
        </section>

        {/* Story Content */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-16">
              {/* Origins */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-playfair text-3xl font-semibold mb-6">
                    The Beginning
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                    Founded in 2019, Lunatiquê began as a dream to capture the ethereal beauty of 
                    celestial bodies in wearable art. Our founder, inspired by late-night stargazing 
                    sessions, saw jewelry as a way to bring the wonder of the cosmos into everyday life.
                  </p>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Each piece in our collection tells a story of cosmic inspiration, from the gentle 
                    curve of a crescent moon to the brilliant sparkle of distant stars.
                  </p>
                </div>
                <div className="aspect-square">
                  <img
                    src="/src/assets/hero-jewelry.jpg"
                    alt="Our beginnings"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Craftsmanship */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="md:order-2">
                  <h2 className="font-playfair text-3xl font-semibold mb-6">
                    Artisan Craftsmanship
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                    Every Lunatiquê piece is meticulously handcrafted by skilled artisans using 
                    traditional techniques passed down through generations. We work exclusively 
                    with ethically sourced materials, including recycled precious metals and 
                    conflict-free gemstones.
                  </p>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Our commitment to quality means each piece undergoes rigorous quality control, 
                    ensuring that every detail meets our exacting standards.
                  </p>
                </div>
                <div className="aspect-square md:order-1">
                  <img
                    src="/src/assets/collection-rings.jpg"
                    alt="Craftsmanship"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Values */}
              <div className="bg-sage/5 rounded-2xl p-12">
                <h2 className="font-playfair text-3xl font-semibold text-center mb-12">
                  Our Values
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="font-playfair text-xl font-semibold mb-4">
                        Sustainability
                      </h3>
                      <p className="text-muted-foreground">
                        We're committed to ethical sourcing and sustainable practices 
                        that protect our planet for future generations.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="font-playfair text-xl font-semibold mb-4">
                        Quality
                      </h3>
                      <p className="text-muted-foreground">
                        Every piece is crafted with meticulous attention to detail, 
                        ensuring lasting beauty and durability.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="font-playfair text-xl font-semibold mb-4">
                        Artistry
                      </h3>
                      <p className="text-muted-foreground">
                        We celebrate the marriage of traditional craftsmanship 
                        with contemporary design innovation.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Mission */}
              <div className="text-center">
                <h2 className="font-playfair text-3xl font-semibold mb-8">
                  Our Mission
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  To create jewelry that not only adorns but inspires, connecting the wearer 
                  to the infinite beauty of the universe while honoring the timeless art of 
                  fine jewelry making.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Story;