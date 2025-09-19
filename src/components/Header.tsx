import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { MegaMenu } from "@/components/Navigation/MegaMenu";
import { Search, Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/components/UserProfile";
import { CartButton } from "@/components/CartButton";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { navigationStructure, loading } = useCategories();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <header className="relative bg-background border-b border-border">
      {/* Announcement Bar */}
      <div className="bg-sage text-sage-foreground text-center py-2 text-sm">
        ¡Ahora ofrecemos envío gratuito en pedidos superiores a 50 soles ! Explora nuestros productos. ✨
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Left section - Search */}
          <div className="flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-64 h-9"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                <span className="text-sm">Search</span>
              </Button>
            )}
          </div>

          {/* Center - Brand Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="font-playfair text-xl sm:text-2xl font-semibold tracking-wide">
              LUNATIQUÊ
            </h1>
          </div>

          {/* Right section - User & Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex">
              <UserProfile />
            </div>
            <CartButton />
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center py-4 border-t border-border">
          {loading ? (
            <div className="flex items-center space-x-8">
              <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-12 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
            </div>
          ) : (
            <MegaMenu navigationData={navigationStructure} />
          )}
        </div>

        {/* FIXED Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10"
                />
              </div>
              
              {/* Fixed Mobile Navigation */}
              <nav className="space-y-1">
                {/* HOME */}
                <a
                  href="/"
                  className="block py-3 px-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  INICIO
                </a>

                {/* SHOP with subcategories */}
                {navigationStructure.map((navItem) => {
                  if (navItem.mainCategory.slug === 'tienda') {
                    const isExpanded = expandedCategories.includes('tienda');
                    
                    return (
                      <div key="tienda" className="space-y-1">
                        <div className="flex items-center justify-between">
                          <a
                            href="/shop"
                            className="flex-1 block py-3 px-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-all"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            TIENDA
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCategory('tienda')}
                            className="p-2"
                          >
                            {isExpanded ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                        
                        {isExpanded && (
                          <div className="ml-4 space-y-1 bg-muted/30 rounded-md p-2">
                            {navItem.sections.map(({ section, subcategories }) => (
                              <div key={section.id} className="space-y-1">
                                <a
                                  href={`/shop/${section.slug}`}
                                  className="block py-2 px-3 text-sm font-medium text-primary hover:bg-accent rounded-md transition-all"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {section.name}
                                </a>
                                {subcategories.length > 0 && (
                                  <div className="ml-4 space-y-1">
                                    {subcategories.map((subcategory) => (
                                      <a
                                        key={subcategory.id}
                                        href={`/shop/${section.slug}/${subcategory.slug}`}
                                        className="block py-1 px-3 text-xs text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-all"
                                        onClick={() => setIsMenuOpen(false)}
                                      >
                                        • {subcategory.name}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}

                {/* SALE */}
                <a
                  href="/sale"
                  className="block py-3 px-2 text-sm font-medium text-destructive hover:text-destructive/80 hover:bg-accent rounded-md transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  SALE
                </a>

                {/* LUNATIQUE with subcategories */}
                {navigationStructure.map((navItem) => {
                  if (navItem.mainCategory.slug === 'lunatique') {
                    const isExpanded = expandedCategories.includes('lunatique');
                    
                    return (
                      <div key="lunatique" className="space-y-1">
                        <div className="flex items-center justify-between">
                          <a
                            href="/lunatique"
                            className="flex-1 block py-3 px-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-all"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            LUNATIQUE
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCategory('lunatique')}
                            className="p-2"
                          >
                            {isExpanded ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                        
                        {isExpanded && (
                          <div className="ml-4 space-y-1 bg-muted/30 rounded-md p-2">
                            {navItem.sections.map(({ section }) => (
                              <a
                                key={section.id}
                                href={`/lunatique/${section.slug}`}
                                className="block py-2 px-3 text-sm text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-all"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {section.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}

                {/* CONTACTANOS */}
                <a
                  href="/contactanos"
                  className="block py-3 px-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  CONTÁCTANOS
                </a>
              </nav>
              
              {/* Mobile User Profile */}
              <div className="pt-4 border-t border-border">
                <UserProfile />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;