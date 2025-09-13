import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  sale_price: z.coerce.number().min(0).optional().nullable(),
  in_stock: z.coerce.boolean(),
  stock_quantity: z.coerce.number().int().min(0, 'Stock quantity must be positive'),
  featured: z.coerce.boolean(),
  slug: z.string().min(1, 'Slug is required'),
}).refine(d => d.sale_price == null || d.sale_price <= d.price, {
  path: ['sale_price'],
  message: 'Sale price must be <= price',
});

type ProductFormData = z.infer<typeof productSchema>;

type Category = Tables<'categories'>;
type Subcategory = Tables<'subcategories'>;

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  images: string[] | null;
  in_stock: boolean;
  stock_quantity: number;
  featured: boolean;
  category_id: string | null;
  subcategory_id: string | null;
  sizes: string[] | null;
  materials: string[] | null;
  colors: string[] | null; // ← Agregado
  slug: string;
}

interface ProductFormProps {
  product?: Product | null;
  onClose: (shouldRefresh?: boolean) => void;
}

export const ProductForm = ({ product, onClose }: ProductFormProps) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [sizes, setSizes] = useState<string[]>(product?.sizes || []);
  const [materials, setMaterials] = useState<string[]>(product?.materials || []);
  const [colors, setColors] = useState<string[]>(product?.colors || []); // ← Agregado
  const [newSize, setNewSize] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newColor, setNewColor] = useState(''); // ← Agregado
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(product?.category_id || '');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>(product?.subcategory_id || '');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const { toast } = useToast();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      sale_price: product?.sale_price || undefined,
      in_stock: product?.in_stock ?? true,
      stock_quantity: product?.stock_quantity || 0,
      featured: product?.featured || false,
      slug: product?.slug || '',
    },
  });

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        setLoadingCategories(true);
        
        // Fetch legacy categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        } else {
          setCategories(categoriesData || []);
        }

        // Fetch subcategories with their section and main category info
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select(`
            *,
            category_section:category_sections(
              name,
              main_category:main_categories(name)
            )
          `)
          .eq('is_active', true)
          .order('display_order');

        if (subcategoriesError) {
          console.error('Error fetching subcategories:', subcategoriesError);
        } else {
          setSubcategories(subcategoriesData || []);
        }
      } catch (error) {
        console.error('Error fetching categories and subcategories:', error);
        toast({
          title: "Error",
          description: "Failed to load categories and subcategories",
          variant: "destructive",
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategoriesAndSubcategories();
  }, [toast]);

  const generateSlug = (name: string) => {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const watchName = form.watch('name');
  useEffect(() => {
    if (watchName && !product) {
      form.setValue('slug', generateSlug(watchName));
    }
  }, [watchName, form, product]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setImages(prev => [...prev, ...uploadedUrls]);
      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      setSizes(prev => [...prev, newSize.trim()]);
      setNewSize('');
    }
  };

  const removeSize = (size: string) => {
    setSizes(prev => prev.filter(s => s !== size));
  };

  const addMaterial = () => {
    if (newMaterial.trim() && !materials.includes(newMaterial.trim())) {
      setMaterials(prev => [...prev, newMaterial.trim()]);
      setNewMaterial('');
    }
  };

  const removeMaterial = (material: string) => {
    setMaterials(prev => prev.filter(m => m !== material));
  };

  // ← Funciones para Colors agregadas
  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors(prev => [...prev, newColor.trim()]);
      setNewColor('');
    }
  };

  const removeColor = (color: string) => {
    setColors(prev => prev.filter(c => c !== color));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const productData = {
        name: data.name,
        description: data.description || null,
        price: data.price,
        sale_price: data.sale_price || null,
        in_stock: data.in_stock,
        stock_quantity: data.stock_quantity,
        featured: data.featured,
        slug: data.slug,
        images,
        sizes: sizes.length > 0 ? sizes : null,
        materials: materials.length > 0 ? materials : null,
        colors: colors.length > 0 ? colors : null, // ← Agregado
        category_id: selectedCategoryId ? String(selectedCategoryId) : null,
        subcategory_id: selectedSubcategoryId ? String(selectedSubcategoryId) : null,
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) {
          console.error('Error updating product:', error);
          if (error.code === '23505') {
            toast({
              title: "Slug duplicado",
              description: "Este slug ya existe. Por favor elige otro.",
              variant: "destructive",
            });
            return;
          }
          toast({
            title: "Error",
            description: "Failed to update product",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) {
          console.error('Error creating product:', error);
          if (error.code === '23505') {
            toast({
              title: "Slug duplicado", 
              description: "Este slug ya existe. Por favor elige otro.",
              variant: "destructive",
            });
            return;
          }
          toast({
            title: "Error",
            description: "Failed to create product",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      onClose(true);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const getSubcategoryDisplayName = (subcategory: any) => {
    const mainCategoryName = subcategory.category_section?.main_category?.name || 'Unknown';
    const sectionName = subcategory.category_section?.name || 'Unknown';
    return `${mainCategoryName} → ${sectionName} → ${subcategory.name}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-7">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onClose()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
          <CardDescription>
            {product ? 'Update product information' : 'Create a new product'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <FormField
                control={form.control}
                name="in_stock"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>In Stock</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Product</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <Label>Product Images</Label>
              <div className="flex items-center gap-4">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    Upload Images
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </Label>
                {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sizes */}
            <div className="space-y-4">
              <Label>Available Sizes</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Add size (e.g., S, M, L, 6, 7, 8)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                />
                <Button type="button" onClick={addSize} variant="outline">
                  Add
                </Button>
              </div>
              {sizes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Colors - Nueva sección agregada */}
            <div className="space-y-4">
              <Label>Available Colors</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Add color (e.g., Red, Blue, Black, White, Rose Gold)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                />
                <Button type="button" onClick={addColor} variant="outline">
                  Add
                </Button>
              </div>
              {colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {colors.map((color, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Category Selection */}
            <div className="space-y-4">
              <Label>Category Assignment</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category_id">Legacy Category (Optional)</Label>
                  <Select
                    value={selectedCategoryId ?? ''}
                    onValueChange={setSelectedCategoryId}
                    disabled={loadingCategories}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Loading..." : "Select legacy category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory_id">Subcategory (Recommended)</Label>
                  <Select
                    value={selectedSubcategoryId ?? ''}
                    onValueChange={setSelectedSubcategoryId}
                    disabled={loadingCategories}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Loading..." : "Select subcategory"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={String(subcategory.id)}>
                          {getSubcategoryDisplayName(subcategory)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Assign products to subcategories for better organization and navigation.
              </p>
            </div>

            {/* Materials */}
            <div className="space-y-4">
              <Label>Materials</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="Add material (e.g., Gold, Silver, Diamond)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                />
                <Button type="button" onClick={addMaterial} variant="outline">
                  Add
                </Button>
              </div>
              {materials.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {materials.map((material, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {material}
                      <button
                        type="button"
                        onClick={() => removeMaterial(material)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => onClose()}>
                Cancel
              </Button>
              <Button type="submit">
                {product ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};