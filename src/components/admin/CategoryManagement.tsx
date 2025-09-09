import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainCategoryManagement } from './MainCategoryManagement';
import { CategorySectionManagement } from './CategorySectionManagement';
import { SubcategoryManagement } from './SubcategoryManagement';
import { FolderOpen, Layers, Grid3X3 } from 'lucide-react';

export const CategoryManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Management</CardTitle>
        <CardDescription>
          Manage your product categories, sections, and subcategories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="main-categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="main-categories" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Main Categories
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Sections
            </TabsTrigger>
            <TabsTrigger value="subcategories" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Subcategories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main-categories">
            <MainCategoryManagement />
          </TabsContent>

          <TabsContent value="sections">
            <CategorySectionManagement />
          </TabsContent>

          <TabsContent value="subcategories">
            <SubcategoryManagement />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};