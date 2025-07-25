
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface PanchayathData {
  name: string;
  district: string;
}

interface Panchayath {
  id: string;
  name: string;
  district: string;
  created_at: string;
  updated_at: string;
}

const PanchayathsManagement = ({ permissions }: { permissions: any }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPanchayath, setEditingPanchayath] = useState<Panchayath | null>(null);
  const [formData, setFormData] = useState<PanchayathData>({
    name: '',
    district: ''
  });

  console.log('PanchayathsManagement permissions:', permissions);

  // Fetch panchayaths
  const { data: panchayaths, isLoading, error } = useQuery({
    queryKey: ['admin-panchayaths'],
    queryFn: async () => {
      console.log('Fetching panchayaths...');
      const { data, error } = await supabase
        .from('panchayaths')
        .select('*')
        .order('district', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching panchayaths:', error);
        throw error;
      }
      console.log('Fetched panchayaths:', data);
      return data as Panchayath[];
    }
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('panchayaths-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'panchayaths'
        },
        () => {
          console.log('Real-time update received for panchayaths');
          queryClient.invalidateQueries({ queryKey: ['admin-panchayaths'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Create/Update panchayath mutation
  const savePanchayathMutation = useMutation({
    mutationFn: async (panchayathData: PanchayathData) => {
      console.log('Saving panchayath:', panchayathData, 'editing:', editingPanchayath?.id);
      
      if (editingPanchayath) {
        const { error } = await supabase
          .from('panchayaths')
          .update({
            ...panchayathData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPanchayath.id);
        
        if (error) {
          console.error('Error updating panchayath:', error);
          throw error;
        }
        console.log('Panchayath updated successfully');
      } else {
        const { error } = await supabase
          .from('panchayaths')
          .insert([panchayathData]);
        
        if (error) {
          console.error('Error creating panchayath:', error);
          throw error;
        }
        console.log('Panchayath created successfully');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-panchayaths'] });
      setIsDialogOpen(false);
      setEditingPanchayath(null);
      setFormData({ name: '', district: '' });
      toast({
        title: editingPanchayath ? "Panchayath Updated" : "Panchayath Created",
        description: `Panchayath has been ${editingPanchayath ? 'updated' : 'created'} successfully.`,
      });
    },
    onError: (error) => {
      console.error('Save panchayath failed:', error);
      toast({
        title: "Operation Failed",
        description: "Failed to save panchayath. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete panchayath mutation
  const deletePanchayathMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting panchayath:', id);
      const { error } = await supabase
        .from('panchayaths')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting panchayath:', error);
        throw error;
      }
      console.log('Panchayath deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-panchayaths'] });
      toast({
        title: "Panchayath Deleted",
        description: "Panchayath has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Delete panchayath failed:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete panchayath. It may be in use by registrations.",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (panchayath: Panchayath) => {
    console.log('Editing panchayath:', panchayath);
    setEditingPanchayath(panchayath);
    setFormData({
      name: panchayath.name,
      district: panchayath.district
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Handle delete called:', id, 'canDelete:', permissions.canDelete);
    if (permissions.canDelete) {
      if (window.confirm('Are you sure you want to delete this panchayath?')) {
        deletePanchayathMutation.mutate(id);
      }
    } else {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete panchayaths.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Handle submit called:', formData, 'canWrite:', permissions.canWrite);
    if (permissions.canWrite) {
      if (!formData.name || !formData.district) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }
      savePanchayathMutation.mutate(formData);
    } else {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to modify panchayaths.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setEditingPanchayath(null);
    setFormData({ name: '', district: '' });
  };

  // Group panchayaths by district
  const panchayathsByDistrict = panchayaths?.reduce((acc, panchayath) => {
    if (!acc[panchayath.district]) {
      acc[panchayath.district] = [];
    }
    acc[panchayath.district].push(panchayath);
    return acc;
  }, {} as Record<string, Panchayath[]>) || {};

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading panchayaths: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Panchayaths Management</CardTitle>
          {permissions.canWrite && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Panchayath
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingPanchayath ? 'Edit Panchayath' : 'Add New Panchayath'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Panchayath Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingPanchayath ? 'Update' : 'Create'} Panchayath
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(panchayathsByDistrict).map(district => (
          <div key={district} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              {district} District ({panchayathsByDistrict[district].length} Panchayaths)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">Panchayath Name</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Created Date</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Updated Date</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {panchayathsByDistrict[district].map((panchayath) => (
                    <tr key={panchayath.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 font-medium">
                        {panchayath.name}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {new Date(panchayath.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {new Date(panchayath.updated_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex gap-2">
                          {permissions.canWrite && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(panchayath)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          {permissions.canDelete && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(panchayath.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!isLoading && (!panchayaths || panchayaths.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No panchayaths found. Create your first panchayath to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PanchayathsManagement;
