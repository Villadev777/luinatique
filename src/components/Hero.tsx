import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-jewelry.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden z-0">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxury jewelry collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="animate-fade-in">
          <h2 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-semibold text-white mb-6 leading-tight">
            Modern jewelry
            <br />
            <span className="italic">that lasts</span>
          </h2>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto leading-relaxed">
            From the sparkliest peaks to the darkest depths, utilizing all materials.
          </p>

          <Button 
            size="lg" 
            variant="secondary"
            className="bg-sage text-sage-foreground hover:bg-sage/90 px-8 py-6 text-base font-medium tracking-wide transition-all duration-300 hover:scale-105 pointer-events-auto"
          >
            SHOP NEW ARRIVALS
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm tracking-wider">SCROLL</span>
          <div className="w-px h-8 bg-white/40"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;