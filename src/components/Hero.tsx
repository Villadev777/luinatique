import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-jewelry.jpg";
import ringsImage from "@/assets/collection-rings.jpg";
import earringsImage from "@/assets/collection-earrings.jpg";
import necklacesImage from "@/assets/collection-necklaces.jpg";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      image: heroImage,
      title: "Modern jewelry",
      subtitle: "that lasts",
      description: "From the sparkliest peaks to the darkest depths, utilizing all materials.",
      buttonText: "SHOP NEW ARRIVALS",
      buttonLink: "/shop"
    },
    {
      id: 2,
      image: ringsImage,
      title: "Signature rings",
      subtitle: "handcrafted",
      description: "Timeless designs that celebrate your unique story and most precious moments.",
      buttonText: "EXPLORE RINGS",
      buttonLink: "/shop/anillos"
    },
    {
      id: 3,
      image: earringsImage,
      title: "Elegant earrings",
      subtitle: "for every occasion",
      description: "From delicate studs to statement pieces, find the perfect pair for you.",
      buttonText: "DISCOVER EARRINGS",
      buttonLink: "/shop/aretes"
    },
    {
      id: 4,
      image: necklacesImage,
      title: "Delicate necklaces",
      subtitle: "that inspire",
      description: "Minimalist pieces that connect you to the infinite beauty of the universe.",
      buttonText: "VIEW NECKLACES",
      buttonLink: "/shop/collares"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    goToSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden z-0">
      {/* Background Images with Transitions */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={`${slide.title} ${slide.subtitle}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 md:left-8 z-20 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 md:right-8 z-20 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="animate-fade-in">
          <h2 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-semibold text-white mb-6 leading-tight">
            {currentSlideData.title}
            <br />
            <span className="italic">{currentSlideData.subtitle}</span>
          </h2>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto leading-relaxed">
            {currentSlideData.description}
          </p>

          <Button 
            size="lg" 
            variant="secondary"
            className="bg-sage text-sage-foreground hover:bg-sage/90 px-8 py-6 text-base font-medium tracking-wide transition-all duration-300 hover:scale-105 pointer-events-auto"
            onClick={() => window.location.href = currentSlideData.buttonLink}
          >
            {currentSlideData.buttonText}
          </Button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Auto-play indicator */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <span className="text-xs text-white/60 tracking-wider">
            {isAutoPlaying ? 'AUTO' : 'MANUAL'}
          </span>
          <div className="w-px h-6 bg-white/40"></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
        <div 
          className="h-full bg-white transition-all duration-300 ease-linear"
          style={{ 
            width: `${((currentSlide + 1) / slides.length) * 100}%` 
          }}
        />
      </div>
    </section>
  );
};

export default Hero;