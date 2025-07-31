
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Plus, ExternalLink } from 'lucide-react';

interface Utility {
  id: string;
  name: string;
  url: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const UtilitiesManagement = () => {
  const { toast } = useToast();
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUtility, setEditingUtility] = useState<Utility | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    is_active: true
  });

  const fetchUtilities = async () => {
    try {
      const { data, error } = await supabase
        .from('utilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUtilities(data || []);
    } catch (error) {
      console.error('Error fetching utilities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch utilities.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilities();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      description: '',
      is_active: true
    });
    setEditingUtility(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUtility) {
        const { error } = await supabase
          .from('utilities')
          .update({
            name: formData.name,
            url: formData.url,
            description: formData.description || null,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingUtility.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Utility updated successfully."
        });
      } else {
        const { error } = await supabase
          .from('utilities')
          .insert([{
            name: formData.name,
            url: formData.url,
            description: formData.description || null,
            is_active: formData.is_active
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Utility created successfully."
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchUtilities();
    } catch (error) {
      console.error('Error saving utility:', error);
      toast({
        title: "Error",
        description: "Failed to save utility.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (utility: Utility) => {
    setEditingUtility(utility);
    setFormData({
      name: utility.name,
      url: utility.url,
      description: utility.description || '',
      is_active: utility.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this utility?')) return;

    try {
      const { error } = await supabase
        .from('utilities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Utility deleted successfully."
      });
      
      fetchUtilities();
    } catch (error) {
      console.error('Error deleting utility:', error);
      toast({
        title: "Error",
        description: "Failed to delete utility.",
        variant: "destructive"
      });
    }
  };

  const toggleUtilityStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('utilities')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Utility ${!currentStatus ? 'activated' : 'deactivated'} successfully.`
      });
      
      fetchUtilities();
    } catch (error) {
      console.error('Error updating utility status:', error);
      toast({
        title: "Error",
        description: "Failed to update utility status.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading utilities...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utilities Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage website utilities that appear in the navigation dropdown
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Utility
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUtility ? 'Edit Utility' : 'Add New Utility'}
              </DialogTitle>
              <DialogDescription>
                {editingUtility 
                  ? 'Update the utility information below.'
                  : 'Add a new utility link that will appear in the navigation dropdown.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter utility name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the utility"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUtility ? 'Update' : 'Create'} Utility
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utilities List</CardTitle>
          <CardDescription>
            All utilities that can appear in the navigation dropdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {utilities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No utilities found.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first utility to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {utilities.map((utility) => (
                  <TableRow key={utility.id}>
                    <TableCell className="font-medium">
                      {utility.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {utility.url}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(utility.url, '_blank')}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Home
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm truncate max-w-[150px] block">
                        {utility.description || 'No description'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={utility.is_active}
                          onCheckedChange={() => toggleUtilityStatus(utility.id, utility.is_active)}
                        />
                        <span className={`text-sm ${utility.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {utility.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(utility)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(utility.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UtilitiesManagement;
