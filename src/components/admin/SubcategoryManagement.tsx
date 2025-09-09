import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subcategory {
  id: string;
  category_section_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  category_section?: {
    name: string;
    main_category?: {
      name: string;
    };
  };
}

interface CategorySection {
  id: string;
  name: string;
  main_category?: {
    name: string;
  };
}

export const SubcategoryManagement = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categorySections, setCategorySections] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    category_section_id: '',
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 0,
    is_active: true,
  });
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch category sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('category_sections')
        .select(`
          id,
          name,
          main_category:main_categories(name)
        `)
        .eq('is_active', true)
        .order('display_order');

      if (sectionsError) {
        console.error('Error fetching sections:', sectionsError);
        return;
      }

      setCategorySections(sectionsData || []);

      // Fetch subcategories with section and main category info
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select(`
          *,
          category_section:category_sections(
            name,
            main_category:main_categories(name)
          )
        `)
        .order('display_order');

      if (subcategoriesError) {
        console.error('Error fetching subcategories:', subcategoriesError);
        toast({
          title: "Error",
          description: "Failed to fetch subcategories",
          variant: "destructive",
        });
        return;
      }

      setSubcategories(subcategoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_order' ? parseInt(value) || 0 : value
    }));

    if (name === 'name' && !editingSubcategory) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `subcategories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        image_url: publicUrl
      }));

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSubcategory) {
        const { error } = await supabase
          .from('subcategories')
          .update(formData)
          .eq('id', editingSubcategory.id);

        if (error) {
          console.error('Error updating subcategory:', error);
          toast({
            title: "Error",
            description: "Failed to update subcategory",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Subcategory updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('subcategories')
          .insert(formData);

        if (error) {
          console.error('Error creating subcategory:', error);
          toast({
            title: "Error",
            description: "Failed to create subcategory",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Subcategory created successfully",
        });
      }

      setShowForm(false);
      setEditingSubcategory(null);
      setFormData({
        category_section_id: '',
        name: '',
        slug: '',
        description: '',
        image_url: '',
        display_order: 0,
        is_active: true,
      });
      fetchData();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to save subcategory",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      category_section_id: subcategory.category_section_id,
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description || '',
      image_url: subcategory.image_url || '',
      display_order: subcategory.display_order,
      is_active: subcategory.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (subcategoryId: string) => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subcategoryId);

      if (error) {
        console.error('Error deleting subcategory:', error);
        toast({
          title: "Error",
          description: "Failed to delete subcategory",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Subcategory deleted successfully",
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to delete subcategory",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Subcategories</h3>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
              </DialogTitle>
              <DialogDescription>
                {editingSubcategory ? 'Update the subcategory information' : 'Create a new subcategory'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category_section_id">Category Section</Label>
                <Select
                  value={formData.category_section_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_section_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category section" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorySections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.main_category?.name} → {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="image">Subcategory Image</Label>
                <div className="flex items-center gap-4">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent">
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </div>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </Label>
                  {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                </div>
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Subcategory preview"
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  name="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSubcategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {subcategories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No subcategories found</p>
          <Button onClick={() => setShowForm(true)}>Create your first subcategory</Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subcategory</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Main Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategories.map((subcategory) => (
                <TableRow key={subcategory.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {subcategory.image_url && (
                        <img
                          src={subcategory.image_url}
                          alt={subcategory.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{subcategory.name}</div>
                        {subcategory.description && (
                          <div className="text-sm text-muted-foreground">
                            {subcategory.description.length > 40
                              ? `${subcategory.description.substring(0, 40)}...`
                              : subcategory.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {subcategory.category_section?.name || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {subcategory.category_section?.main_category?.name || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {subcategory.slug}
                    </code>
                  </TableCell>
                  <TableCell>{subcategory.display_order}</TableCell>
                  <TableCell>
                    <Badge variant={subcategory.is_active ? "default" : "secondary"}>
                      {subcategory.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(subcategory)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{subcategory.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(subcategory.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};