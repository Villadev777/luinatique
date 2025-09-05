import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Journal = () => {
  const articles = [
    {
      id: 1,
      title: "The Art of Celestial Jewelry Design",
      excerpt: "Discover the inspiration behind our cosmic collections and the ancient symbolism of celestial motifs in jewelry.",
      category: "Design",
      readTime: "5 min read",
      date: "March 15, 2024",
      image: "/src/assets/collection-necklaces.jpg",
      featured: true
    },
    {
      id: 2,
      title: "Caring for Your Precious Jewelry",
      excerpt: "Essential tips to maintain the brilliance and longevity of your Lunatiquê pieces for generations to come.",
      category: "Care Guide",
      readTime: "3 min read",
      date: "March 10, 2024",
      image: "/src/assets/collection-rings.jpg",
      featured: false
    },
    {
      id: 3,
      title: "The Meaning Behind Moon Phases",
      excerpt: "Explore the symbolic significance of lunar cycles and how they inspire our Luna Collection designs.",
      category: "Inspiration",
      readTime: "4 min read",
      date: "March 5, 2024",
      image: "/src/assets/collection-earrings.jpg",
      featured: false
    },
    {
      id: 4,
      title: "Sustainable Jewelry: Our Commitment",
      excerpt: "Learn about our ethical sourcing practices and commitment to environmental responsibility.",
      category: "Sustainability",
      readTime: "6 min read",
      date: "February 28, 2024",
      image: "/src/assets/hero-jewelry.jpg",
      featured: false
    },
    {
      id: 5,
      title: "Styling Guide: Layering Necklaces",
      excerpt: "Master the art of layering delicate necklaces to create a personalized celestial look.",
      category: "Style",
      readTime: "4 min read",
      date: "February 20, 2024",
      image: "/src/assets/collection-necklaces.jpg",
      featured: false
    },
    {
      id: 6,
      title: "The Story of Vintage Star Maps",
      excerpt: "How ancient star charts influence our modern constellation jewelry designs.",
      category: "History",
      readTime: "7 min read",
      date: "February 15, 2024",
      image: "/src/assets/collection-earrings.jpg",
      featured: false
    }
  ];

  const featuredArticle = articles.find(article => article.featured);
  const regularArticles = articles.filter(article => !article.featured);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-sage/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-foreground mb-6">
              Journal
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Stories of inspiration, craftsmanship, and the cosmic beauty that guides our designs.
            </p>
          </div>
        </section>

        {/* Featured Article */}
        {featuredArticle && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-[4/3] md:aspect-auto">
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                    <Badge className="w-fit mb-4 bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                    <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-4">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <Badge variant="outline">{featuredArticle.category}</Badge>
                      <span>{featuredArticle.date}</span>
                      <span>{featuredArticle.readTime}</span>
                    </div>
                    <Button className="w-fit">
                      Read Article
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Articles Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularArticles.map((article) => (
                <Card key={article.id} className="group cursor-pointer overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{article.readTime}</span>
                    </div>
                    <h3 className="font-playfair text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{article.date}</span>
                      <Button variant="ghost" size="sm" className="p-0 h-auto font-semibold">
                        Read More →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 bg-sage/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
              Stay Inspired
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Subscribe to our journal for the latest stories, design insights, and cosmic inspiration.
            </p>
            <Button size="lg">
              Subscribe to Newsletter
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Journal;