export interface MainCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CategorySection {
  id: string;
  main_category_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  main_category?: MainCategory;
}

export interface Subcategory {
  id: string;
  category_section_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  category_section?: CategorySection;
}

export interface NavigationStructure {
  mainCategory: MainCategory;
  sections: Array<{
    section: CategorySection;
    subcategories: Subcategory[];
  }>;
}