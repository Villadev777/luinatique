import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MainCategory, CategorySection, Subcategory, NavigationStructure } from '@/types/categories';

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

  const fetchCategorySections = async (mainCategoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('category_sections')
        .select('*')
        .eq('main_category_id', mainCategoryId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching category sections:', err);
      return [];
    }
  };

  const fetchSubcategories = async (sectionId: string) => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_section_id', sectionId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      return [];
    }
  };

  const fetchFullNavigationStructure = async () => {
    try {
      setLoading(true);
      const mainCats = await fetchMainCategories();
      
      const navigationData: NavigationStructure[] = [];

      for (const mainCat of mainCats) {
        const sections = await fetchCategorySections(mainCat.id);
        const sectionsWithSubcategories = [];

        for (const section of sections) {
          const subcategories = await fetchSubcategories(section.id);
          sectionsWithSubcategories.push({
            section,
            subcategories
          });
        }

        navigationData.push({
          mainCategory: mainCat,
          sections: sectionsWithSubcategories
        });
      }

      setNavigationStructure(navigationData);
    } catch (err) {
      console.error('Error fetching navigation structure:', err);
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

  useEffect(() => {
    fetchFullNavigationStructure();
  }, []);

  return {
    mainCategories,
    navigationStructure,
    loading,
    error,
    refetch: fetchFullNavigationStructure,
    getShopCategories,
    getLunatiqueInfo,
    getSaleCategories
  };
};