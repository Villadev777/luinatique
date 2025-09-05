import { Button } from "@/components/ui/button";

const AboutSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight">
              Crafted with
              <br />
              <span className="italic text-luxury">passion & precision</span>
            </h2>
            
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                At Lunatiquê, we believe that jewelry is more than mere adornment—it's 
                a reflection of your unique story, your dreams, and your most cherished moments.
              </p>
              
              <p>
                Each piece in our collection is meticulously handcrafted by skilled artisans 
                who share our commitment to exceptional quality and timeless design. We source 
                only the finest materials, from ethically-sourced gemstones to premium metals, 
                ensuring that every creation meets our exacting standards.
              </p>
              
              <p>
                Our design philosophy celebrates the beauty of simplicity while embracing 
                the power of meaningful details. We create jewelry that transcends trends, 
                pieces that will be treasured for generations to come.
              </p>
            </div>

            <div className="pt-6">
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-base font-medium tracking-wide transition-all duration-300"
              >
                DISCOVER OUR STORY
              </Button>
            </div>
          </div>

          {/* Image Grid */}
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
  );
};

export default AboutSection;