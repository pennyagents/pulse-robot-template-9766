import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Shield, UserPlus } from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  role: string;
}

interface Permission {
  module: string;
  permission_type: string;
}

interface ModulePermissions {
  [module: string]: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
}

const AVAILABLE_MODULES = [
  { id: 'accounts', name: 'Accounts Management', description: 'Manage cash transactions and expenses' },
  { id: 'registrations', name: 'Registrations', description: 'Manage user registrations and applications' },
  { id: 'categories', name: 'Categories', description: 'Manage service categories' },
  { id: 'panchayaths', name: 'Panchayaths', description: 'Manage panchayath data' },
  { id: 'announcements', name: 'Announcements', description: 'Manage public announcements' },
  { id: 'utilities', name: 'Utilities', description: 'Manage utility links' },
  { id: 'reports', name: 'Reports', description: 'View and generate reports' },
  { id: 'admin_users', name: 'Admin Users', description: 'Manage admin users and permissions' },
  { id: 'pending_registrations_alert', name: 'Pending Registrations Alert', description: 'View pending registrations expiring within 5 days' }
];

const PERMISSION_TYPES = [
  { id: 'read', name: 'Read', description: 'View data' },
  { id: 'write', name: 'Write', description: 'Create and edit data' },
  { id: 'delete', name: 'Delete', description: 'Delete data' }
];

const AdminPermissionsManagement = ({ permissions }: { permissions: any }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');
  const [modulePermissions, setModulePermissions] = useState<ModulePermissions>({});

  // Fetch admin users (excluding super_admins as they have all permissions)
  const { data: adminUsers } = useQuery({
    queryKey: ['admin-users-for-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, role')
        .neq('role', 'super_admin')
        .eq('is_active', true)
        .order('username');
      
      if (error) throw error;
      return data as AdminUser[];
    },
    enabled: permissions.canManageAdmins
  });

  // Fetch permissions for selected admin
  const { data: currentPermissions } = useQuery({
    queryKey: ['admin-permissions', selectedAdmin],
    queryFn: async () => {
      if (!selectedAdmin) return [];
      
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('module, permission_type')
        .eq('admin_user_id', selectedAdmin);
      
      if (error) throw error;
      return data as Permission[];
    },
    enabled: !!selectedAdmin
  });

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async (adminId: string) => {
      // First, delete existing permissions for this admin
      await supabase
        .from('admin_permissions')
        .delete()
        .eq('admin_user_id', adminId);

      // Then insert new permissions
      const permissionsToInsert: any[] = [];
      
      Object.entries(modulePermissions).forEach(([module, perms]) => {
        Object.entries(perms).forEach(([permType, hasPermission]) => {
          if (hasPermission) {
            permissionsToInsert.push({
              admin_user_id: adminId,
              module,
              permission_type: permType
            });
          }
        });
      });

      if (permissionsToInsert.length > 0) {
        const { error } = await supabase
          .from('admin_permissions')
          .insert(permissionsToInsert);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
      toast({
        title: "Permissions Updated",
        description: "Admin permissions have been updated successfully.",
      });
      setIsDialogOpen(false);
      setSelectedAdmin('');
      setModulePermissions({});
    },
    onError: (error) => {
      console.error('Update permissions failed:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Initialize permissions when admin is selected or permissions are loaded
  React.useEffect(() => {
    if (currentPermissions) {
      const perms: ModulePermissions = {};
      
      // Initialize all modules with false permissions
      AVAILABLE_MODULES.forEach(module => {
        perms[module.id] = { read: false, write: false, delete: false };
      });
      
      // Set existing permissions to true
      currentPermissions.forEach(perm => {
        if (perms[perm.module]) {
          perms[perm.module][perm.permission_type as keyof typeof perms[string]] = true;
        }
      });
      
      setModulePermissions(perms);
    }
  }, [currentPermissions]);

  const handleAdminSelect = (adminId: string) => {
    setSelectedAdmin(adminId);
  };

  const handlePermissionChange = (module: string, permissionType: string, checked: boolean) => {
    setModulePermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permissionType]: checked
      }
    }));
  };

  const handleSave = () => {
    if (!selectedAdmin) {
      toast({
        title: "Select Admin",
        description: "Please select an admin user first.",
        variant: "destructive"
      });
      return;
    }
    
    updatePermissionsMutation.mutate(selectedAdmin);
  };

  const resetForm = () => {
    setSelectedAdmin('');
    setModulePermissions({});
  };

  if (!permissions.canManageAdmins) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            You don't have permission to manage admin permissions.
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
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Admin Permissions Management</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Assign Permissions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Assign Admin Permissions
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="admin-select">Select Admin User</Label>
                  <Select value={selectedAdmin} onValueChange={handleAdminSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an admin user" />
                    </SelectTrigger>
                    <SelectContent>
                      {adminUsers?.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.username} ({admin.role.replace('_', ' ').toUpperCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAdmin && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Module Permissions</h3>
                    <div className="grid gap-4">
                      {AVAILABLE_MODULES.map((module) => (
                        <Card key={module.id} className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium">{module.name}</h4>
                              <p className="text-sm text-muted-foreground">{module.description}</p>
                            </div>
                            <div className="flex gap-6">
                              {PERMISSION_TYPES.map((permType) => (
                                <div key={permType.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${module.id}-${permType.id}`}
                                    checked={modulePermissions[module.id]?.[permType.id as keyof ModulePermissions[string]] || false}
                                    onCheckedChange={(checked) => 
                                      handlePermissionChange(module.id, permType.id, checked as boolean)
                                    }
                                  />
                                  <Label 
                                    htmlFor={`${module.id}-${permType.id}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {permType.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={!selectedAdmin || updatePermissionsMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Permissions'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Assign specific permissions to admin users. Super admins automatically have all permissions.
          </p>
          
          {adminUsers && adminUsers.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium">Current Admin Users</h3>
              <div className="grid gap-3">
                {adminUsers.map((admin) => (
                  <Card key={admin.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{admin.username}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({admin.role.replace('_', ' ').toUpperCase()})
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAdmin(admin.id);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Manage Permissions
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No admin users available for permission assignment.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPermissionsManagement;