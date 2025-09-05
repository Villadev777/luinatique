import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ringsImage from "@/assets/collection-rings.jpg";
import earringsImage from "@/assets/collection-earrings.jpg";
import necklacesImage from "@/assets/collection-necklaces.jpg";

const FeaturedCollections = () => {
  const collections = [
    {
      title: "Signature Rings",
      description: "Timeless designs crafted for everyday elegance",
      image: ringsImage,
      href: "#rings"
    },
    {
      title: "Pearl Earrings",
      description: "Classic pearls reimagined for the modern woman",
      image: earringsImage,
      href: "#earrings"
    },
    {
      title: "Delicate Necklaces",
      description: "Minimalist pieces that make a statement",
      image: necklacesImage,
      href: "#necklaces"
    }
  ];

  return (
    <section className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            Featured Collections
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our curated selection of handcrafted jewelry, 
            each piece telling its own unique story of elegance and grace.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <Card 
              key={collection.title}
              className="group cursor-pointer overflow-hidden border-0 bg-background shadow-sm hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              </div>
              
              <div className="p-6">
                <h3 className="font-playfair text-xl font-semibold text-foreground mb-2">
                  {collection.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {collection.description}
                </p>
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto text-primary hover:text-primary/80 font-medium tracking-wide"
                >
                  EXPLORE COLLECTION →
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button 
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-medium tracking-wide transition-all duration-300 hover:scale-105"
          >
            VIEW ALL COLLECTIONS
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;