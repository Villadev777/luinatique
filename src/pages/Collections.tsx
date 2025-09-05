import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Collections = () => {
  const collections = [
    {
      id: 1,
      name: "Luna Collection",
      description: "Inspired by the mystical beauty of moonlight, featuring crescent moon motifs and pearl accents.",
      image: "/src/assets/collection-rings.jpg",
      productCount: 12,
      startingPrice: 185
    },
    {
      id: 2,
      name: "Celestial Dreams",
      description: "Capture the magic of the night sky with star-inspired designs and constellation patterns.",
      image: "/src/assets/collection-necklaces.jpg",
      productCount: 15,
      startingPrice: 220
    },
    {
      id: 3,
      name: "Stellar Elegance",
      description: "Sophisticated pieces that blend modern design with cosmic inspiration.",
      image: "/src/assets/collection-earrings.jpg",
      productCount: 9,
      startingPrice: 195
    },
    {
      id: 4,
      name: "Cosmic Harmony",
      description: "Delicate jewelry that celebrates the balance and beauty of the universe.",
      image: "/src/assets/hero-jewelry.jpg",
      productCount: 18,
      startingPrice: 165
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-sage/10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-foreground mb-6">
              Our Collections
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Each collection tells a unique story inspired by the cosmos, crafted with precision and passion to create jewelry that transcends time.
            </p>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {collections.map((collection, index) => (
                <Card key={collection.id} className="group overflow-hidden">
                  <div className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-col-reverse' : ''}`}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-8">
                      <h2 className="font-playfair text-3xl font-semibold mb-4">
                        {collection.name}
                      </h2>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                        {collection.description}
                      </p>
                      <div className="flex justify-between items-center mb-6">
                        <div className="text-sm text-muted-foreground">
                          <span>{collection.productCount} pieces</span>
                          <span className="mx-2">•</span>
                          <span>Starting at ${collection.startingPrice}</span>
                        </div>
                      </div>
                      <Button className="w-full">
                        Explore Collection
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-sage/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We offer custom design services to create a unique piece just for you.
            </p>
            <Button size="lg" variant="outline">
              Custom Design Consultation
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Collections;