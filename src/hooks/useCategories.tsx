import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MainCategory, CategorySection, Subcategory, NavigationStructure } from '@/types/categories';

// Cache global para evitar múltiples fetches
let cachedNavigationStructure: NavigationStructure[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useCategories = () => {
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [navigationStructure, setNavigationStructure] = useState<NavigationStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMainCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('main_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setMainCategories(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching main categories:', err);
      setError('Failed to fetch main categories');
      return [];
    }
  };

  // 🚀 OPTIMIZACIÓN: Una sola consulta con JOIN en lugar de N queries
  const fetchFullNavigationStructureOptimized = async () => {
    try {
      setLoading(true);

      // Verificar si tenemos caché válido
      const now = Date.now();
      if (cachedNavigationStructure && (now - cacheTimestamp) < CACHE_DURATION) {
        console.log('✅ Using cached navigation structure');
        setNavigationStructure(cachedNavigationStructure);
        setMainCategories(cachedNavigationStructure.map(nav => nav.mainCategory));
        setLoading(false);
        return;
      }

      console.log('🔄 Fetching fresh navigation structure...');

      // Fetch todo en paralelo en lugar de secuencial
      const [mainCatsResult, sectionsResult, subcategoriesResult] = await Promise.all([
        supabase
          .from('main_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order'),
        
        supabase
          .from('category_sections')
          .select('*')
          .eq('is_active', true)
          .order('display_order'),
        
        supabase
          .from('subcategories')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
      ]);

      if (mainCatsResult.error) throw mainCatsResult.error;
      if (sectionsResult.error) throw sectionsResult.error;
      if (subcategoriesResult.error) throw subcategoriesResult.error;

      const mainCats = mainCatsResult.data || [];
      const sections = sectionsResult.data || [];
      const subcategories = subcategoriesResult.data || [];

      // Construir la estructura en memoria (mucho más rápido)
      const navigationData: NavigationStructure[] = mainCats.map(mainCat => {
        const mainCatSections = sections
          .filter(section => section.main_category_id === mainCat.id)
          .map(section => ({
            section,
            subcategories: subcategories.filter(
              subcat => subcat.category_section_id === section.id
            )
          }));

        return {
          mainCategory: mainCat,
          sections: mainCatSections
        };
      });

      // Actualizar caché
      cachedNavigationStructure = navigationData;
      cacheTimestamp = Date.now();

      setMainCategories(mainCats);
      setNavigationStructure(navigationData);
      
      console.log('✅ Navigation structure loaded successfully');
    } catch (err) {
      console.error('❌ Error fetching navigation structure:', err);
      setError('Failed to fetch navigation structure');
    } finally {
      setLoading(false);
    }
  };

  const getShopCategories = () => {
    return navigationStructure.find(nav => nav.mainCategory.slug === 'tienda');
  };

  const getLunatiqueInfo = () => {
    return navigationStructure.find(nav => nav.mainCategory.slug === 'lunatique');
  };

  const getSaleCategories = () => {
    return navigationStructure.find(nav => nav.mainCategory.slug === 'sale');
  };

  // Función para limpiar el caché manualmente si es necesario
  const clearCache = () => {
    cachedNavigationStructure = null;
    cacheTimestamp = 0;
  };

  useEffect(() => {
    fetchFullNavigationStructureOptimized();
  }, []);

  return {
    mainCategories,
    navigationStructure,
    loading,
    error,
    refetch: fetchFullNavigationStructureOptimized,
    clearCache,
    getShopCategories,
    getLunatiqueInfo,
    getSaleCategories
  };
};