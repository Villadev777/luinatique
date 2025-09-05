import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Newsletter = () => {
  return (
    <section className="py-20 bg-sage">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-sage-foreground mb-4">
          Stay in the know
        </h2>
        
        <p className="text-lg text-sage-foreground/80 mb-8 max-w-2xl mx-auto">
          Be the first to discover our new collections, exclusive offers, 
          and behind-the-scenes stories from our atelier.
        </p>

        <div className="max-w-md mx-auto">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-background border-background text-foreground placeholder:text-muted-foreground"
            />
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-medium tracking-wide"
            >
              SUBSCRIBE
            </Button>
          </div>
          
          <p className="text-sm text-sage-foreground/60 mt-3">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;