import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MainCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export const MainCategoryManagement = () => {
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MainCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    display_order: 0,
    is_active: true,
  });
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('main_categories')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Error fetching main categories:', error);
        toast({
          title: "Error",
          description: "Failed to fetch main categories",
          variant: "destructive",
        });
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching main categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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

    if (name === 'name' && !editingCategory) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('main_categories')
          .update(formData)
          .eq('id', editingCategory.id);

        if (error) {
          console.error('Error updating category:', error);
          toast({
            title: "Error",
            description: "Failed to update category",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('main_categories')
          .insert(formData);

        if (error) {
          console.error('Error creating category:', error);
          toast({
            title: "Error",
            description: "Failed to create category",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }

      setShowForm(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        display_order: 0,
        is_active: true,
      });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: MainCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('main_categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Error deleting category:', error);
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      display_order: categories.length,
      is_active: true,
    });
    setShowForm(true);
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
        <h3 className="text-lg font-semibold">Main Categories</h3>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Main Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Main Category' : 'Add Main Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update the main category information' : 'Create a new main category'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No main categories found</p>
          <Button onClick={handleAddNew}>Create your first main category</Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-muted-foreground">
                          {category.description.length > 50
                            ? `${category.description.substring(0, 50)}...`
                            : category.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {category.slug}
                    </code>
                  </TableCell>
                  <TableCell>{category.display_order}</TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(category.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
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
                            <AlertDialogTitle>Delete Main Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{category.name}"? This will also delete all associated sections and subcategories. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
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