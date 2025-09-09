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

interface CategorySection {
  id: string;
  main_category_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  main_category?: {
    name: string;
  };
}

interface MainCategory {
  id: string;
  name: string;
  slug: string;
}

export const CategorySectionManagement = () => {
  const [sections, setSections] = useState<CategorySection[]>([]);
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<CategorySection | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    main_category_id: '',
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
      // Fetch main categories
      const { data: mainCatsData, error: mainCatsError } = await supabase
        .from('main_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order');

      if (mainCatsError) {
        console.error('Error fetching main categories:', mainCatsError);
        return;
      }

      setMainCategories(mainCatsData || []);

      // Fetch sections with main category info
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('category_sections')
        .select(`
          *,
          main_category:main_categories(name)
        `)
        .order('display_order');

      if (sectionsError) {
        console.error('Error fetching sections:', sectionsError);
        toast({
          title: "Error",
          description: "Failed to fetch category sections",
          variant: "destructive",
        });
        return;
      }

      setSections(sectionsData || []);
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

    if (name === 'name' && !editingSection) {
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
      const filePath = `category-sections/${fileName}`;

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
      if (editingSection) {
        const { error } = await supabase
          .from('category_sections')
          .update(formData)
          .eq('id', editingSection.id);

        if (error) {
          console.error('Error updating section:', error);
          toast({
            title: "Error",
            description: "Failed to update section",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Section updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('category_sections')
          .insert(formData);

        if (error) {
          console.error('Error creating section:', error);
          toast({
            title: "Error",
            description: "Failed to create section",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Section created successfully",
        });
      }

      setShowForm(false);
      setEditingSection(null);
      setFormData({
        main_category_id: '',
        name: '',
        slug: '',
        description: '',
        image_url: '',
        display_order: 0,
        is_active: true,
      });
      fetchData();
    } catch (error) {
      console.error('Error saving section:', error);
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (section: CategorySection) => {
    setEditingSection(section);
    setFormData({
      main_category_id: section.main_category_id,
      name: section.name,
      slug: section.slug,
      description: section.description || '',
      image_url: section.image_url || '',
      display_order: section.display_order,
      is_active: section.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from('category_sections')
        .delete()
        .eq('id', sectionId);

      if (error) {
        console.error('Error deleting section:', error);
        toast({
          title: "Error",
          description: "Failed to delete section",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Section deleted successfully",
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        title: "Error",
        description: "Failed to delete section",
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
        <h3 className="text-lg font-semibold">Category Sections</h3>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSection ? 'Edit Category Section' : 'Add Category Section'}
              </DialogTitle>
              <DialogDescription>
                {editingSection ? 'Update the section information' : 'Create a new category section'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="main_category_id">Main Category</Label>
                <Select
                  value={formData.main_category_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, main_category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select main category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
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
                <Label htmlFor="image">Section Image</Label>
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
                      alt="Section preview"
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
                  {editingSection ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No category sections found</p>
          <Button onClick={() => setShowForm(true)}>Create your first section</Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section</TableHead>
                <TableHead>Main Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => (
                <TableRow key={section.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {section.image_url && (
                        <img
                          src={section.image_url}
                          alt={section.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{section.name}</div>
                        {section.description && (
                          <div className="text-sm text-muted-foreground">
                            {section.description.length > 40
                              ? `${section.description.substring(0, 40)}...`
                              : section.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {section.main_category?.name || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {section.slug}
                    </code>
                  </TableCell>
                  <TableCell>{section.display_order}</TableCell>
                  <TableCell>
                    <Badge variant={section.is_active ? "default" : "secondary"}>
                      {section.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(section)}
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
                            <AlertDialogTitle>Delete Category Section</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{section.name}"? This will also delete all associated subcategories. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(section.id)}
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