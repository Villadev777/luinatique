import React from 'react';
import { NavigationStructure } from '@/types/categories';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

interface MegaMenuProps {
  navigationData: NavigationStructure[];
  className?: string;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ navigationData, className }) => {
  const shopData = navigationData.find(nav => nav.mainCategory.slug === 'tienda');
  const lunatiqueData = navigationData.find(nav => nav.mainCategory.slug === 'lunatique');

  return (
    <NavigationMenu className={className}>
      <NavigationMenuList>
        {/* INICIO */}
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/"
            className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            INICIO
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* TIENDA - Mega Menu */}
        {shopData && (
          <NavigationMenuItem>
            <NavigationMenuTrigger>TIENDA</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[800px] grid-cols-3 gap-6 p-6">
                {shopData.sections.map(({ section, subcategories }) => (
                  <div key={section.id} className="space-y-3">
                    <h4 className="font-extrabold text-sm text-primary uppercase tracking-wide">
                      {section.name}
                    </h4>
                    <ul className="space-y-2">
                      {subcategories.map((subcategory) => (
                        <li key={subcategory.id}>
                          <NavigationMenuLink
                            href={`/shop/${section.slug}/${subcategory.slug}`}
                            className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
                          >
                            {subcategory.name}
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                    <NavigationMenuLink
                      href={`/shop/${section.slug}`}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Ver todos los {section.name.toLowerCase()} →
                    </NavigationMenuLink>
                  </div>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {/* SALE */}
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/sale"
            className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 text-destructive"
          >
            SALE
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* LUNATIQUE - Dropdown */}
        {lunatiqueData && (
          <NavigationMenuItem>
            <NavigationMenuTrigger>LUNATIQUE</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[400px] p-4">
                <ul className="space-y-2">
                  <li>
                    <NavigationMenuLink
                      href="/lunatique"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-bold leading-none">
                        Sobre Lunatiquê
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Conoce nuestra historia, valores y equipo
                      </p>
                    </NavigationMenuLink>
                  </li>
                  {lunatiqueData.sections.map(({ section }) => (
                    <li key={section.id}>
                      <NavigationMenuLink
                        href={`/lunatique/${section.slug}`}
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-bold leading-none">
                          {section.name}
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {section.description}
                        </p>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {/* CONTACTANOS */}
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/contactanos"
            className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            CONTACTANOS
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-bold leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";