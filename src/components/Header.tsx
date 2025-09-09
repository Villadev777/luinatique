import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { MegaMenu } from "@/components/Navigation/MegaMenu";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/components/UserProfile";
import { CartSidebar } from "@/components/CartSidebar";
import { useCart } from "@/context/CartContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { navigationStructure, loading } = useCategories();
  const { state } = useCart();
  return (
    <header className="relative bg-background border-b border-border">
      {/* Announcement Bar */}
      <div className="bg-sage text-sage-foreground text-center py-2 text-sm">
        We are now offering complimentary shipping on orders all over $50! Explore our products. ✨
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
            <h1 className="font-playfair text-2xl font-semibold tracking-wide">
              Lunatiquê
            </h1>
          </div>

          {/* Right section - User & Cart */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex">
              <UserProfile />
            </div>
            <CartSidebar>
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingBag className="h-4 w-4" />
                {state.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                    {state.totalItems}
                  </span>
                )}
                <span className="sr-only">
                  Shopping cart with {state.totalItems} items
                </span>
              </Button>
            </CartSidebar>
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="px-4 py-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10"
                />
              </div>
              <nav className="space-y-2">
                {navigationStructure.map((navItem) => (
                  <div key={navItem.mainCategory.id} className="space-y-2">
                    <a
                      href={`/${navItem.mainCategory.slug}`}
                      className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {navItem.mainCategory.name}
                    </a>
                    {navItem.sections.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {navItem.sections.map(({ section, subcategories }) => (
                          <div key={section.id}>
                            <a
                              href={`/${navItem.mainCategory.slug}/${section.slug}`}
                              className="block py-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {section.name}
                            </a>
                            {subcategories.length > 0 && (
                              <div className="ml-4 space-y-1">
                                {subcategories.map((subcategory) => (
                                  <a
                                    key={subcategory.id}
                                    href={`/${navItem.mainCategory.slug}/${section.slug}/${subcategory.slug}`}
                                    className="block py-1 text-xs text-muted-foreground hover:text-primary transition-colors"
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
                ))}
              </nav>
              <div className="pt-4 border-t border-border">
                <div className="md:hidden">
                  <UserProfile />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

                className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 tracking-wide"
              >
                {item.name}
              </a>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-4 py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10"
              />
            </div>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="pt-4 border-t border-border">
              <div className="md:hidden">
                <UserProfile />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;