
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Shield, Info } from 'lucide-react';

interface AdminData {
  username: string;
  password: string;
  role: 'super_admin' | 'local_admin' | 'user_admin';
  is_active: boolean;
}

interface AdminUser {
  id: string;
  username: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

const AdminManagement = ({ permissions }: { permissions: any }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<AdminData>({
    username: '',
    password: '',
    role: 'user_admin',
    is_active: true
  });

  console.log('AdminManagement permissions:', permissions);

  // Fetch admin users
  const { data: adminUsers, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log('Fetching admin users...');
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching admin users:', error);
        throw error;
      }
      console.log('Fetched admin users:', data);
      return data as AdminUser[];
    },
    enabled: permissions.canManageAdmins
  });

  // Create/Update admin mutation
  const saveAdminMutation = useMutation({
    mutationFn: async (adminData: AdminData) => {
      console.log('Saving admin:', adminData, 'editing:', editingAdmin?.id);
      
      if (editingAdmin) {
        // Update existing admin
        const updateData: any = {
          role: adminData.role,
          is_active: adminData.is_active
        };
        
        // Only update password if provided
        if (adminData.password) {
          const bcrypt = await import('bcryptjs');
          updateData.password_hash = await bcrypt.hash(adminData.password, 6);
        }

        const { error } = await supabase
          .from('admin_users')
          .update(updateData)
          .eq('id', editingAdmin.id);
        
        if (error) {
          console.error('Error updating admin:', error);
          throw error;
        }
        console.log('Admin updated successfully');
      } else {
        // Create new admin
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(adminData.password, 6);
        
        const { error } = await supabase
          .from('admin_users')
          .insert([{
            username: adminData.username,
            password_hash: hashedPassword,
            role: adminData.role,
            is_active: adminData.is_active
          }]);
        
        if (error) {
          console.error('Error creating admin:', error);
          throw error;
        }
        console.log('Admin created successfully');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsDialogOpen(false);
      setEditingAdmin(null);
      setFormData({
        username: '',
        password: '',
        role: 'user_admin',
        is_active: true
      });
      toast({
        title: editingAdmin ? "Admin Updated" : "Admin Created",
        description: `Admin has been ${editingAdmin ? 'updated' : 'created'} successfully.`,
      });
    },
    onError: (error) => {
      console.error('Save admin failed:', error);
      toast({
        title: "Operation Failed",
        description: "Failed to save admin. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete admin mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting admin:', id);
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting admin:', error);
        throw error;
      }
      console.log('Admin deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Admin Deleted",
        description: "Admin has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Delete admin failed:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete admin. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (admin: AdminUser) => {
    console.log('Editing admin:', admin);
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      password: '',
      role: admin.role as any,
      is_active: admin.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Handle delete called:', id);
    if (window.confirm('Are you sure you want to delete this admin?')) {
      deleteAdminMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Handle submit called:', formData);
    
    if (!editingAdmin && (!formData.username || !formData.password)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    saveAdminMutation.mutate(formData);
  };

  const resetForm = () => {
    setEditingAdmin(null);
    setFormData({
      username: '',
      password: '',
      role: 'user_admin',
      is_active: true
    });
  };

  if (!permissions.canManageAdmins) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            You don't have permission to manage admin users.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading admin users: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            <CardTitle>Admin Control</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    disabled={!!editingAdmin}
                    required={!editingAdmin}
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">
                    Password {editingAdmin && '(leave empty to keep current)'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required={!editingAdmin}
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user_admin">User Admin</SelectItem>
                      <SelectItem value="local_admin">Local Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingAdmin ? 'Update' : 'Create'} Admin
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-yellow-600" />
            <h4 className="font-semibold text-yellow-800">Test Credentials:</h4>
          </div>
          <div className="text-xs space-y-1 text-yellow-700">
            <p><strong>Super Admin:</strong> anas / eva919123</p>
            <p><strong>Local Admin:</strong> adminlocal / admin9094</p>
            <p><strong>User Admin:</strong> adminuser / user123</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left">Username</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Role</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Created</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Last Login</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers?.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">
                    {admin.username}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      admin.role === 'super_admin'
                        ? 'bg-red-100 text-red-800'
                        : admin.role === 'local_admin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {admin.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      admin.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {new Date(admin.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {admin.last_login ? new Date(admin.last_login).toLocaleDateString('en-IN') : 'Never'}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(admin)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(admin.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!isLoading && (!adminUsers || adminUsers.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No admin users found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminManagement;
