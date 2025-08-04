import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import RegistrationEditDialog from './RegistrationEditDialog';
import RegistrationsFilters from './registrations/RegistrationsFilters';
import RegistrationsTableHeader from './registrations/RegistrationsTableHeader';
import RegistrationsTableActions from './registrations/RegistrationsTableActions';
import { getCategoryColor, getStatusBadge } from './registrations/utils';
import { exportToExcel, exportToPDF } from './registrations/exportUtils';
import { 
  Registration, 
  Category, 
  ApplicationStatus, 
  UpdateStatusParams,
  RegistrationsPermissions 
} from './registrations/types';

const RegistrationsManagement = ({
  permissions
}: {
  permissions: RegistrationsPermissions;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [panchayathFilter, setPanchayathFilter] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [expiryDaysFilter, setExpiryDaysFilter] = useState<number | null>(null);

  console.log('RegistrationsManagement permissions:', permissions);

  // Helper function to calculate days remaining for pending registrations
  const calculateDaysRemaining = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 15 - diffDays);
  };

  // Fetch registrations with real-time updates
  const {
    data: registrations,
    isLoading,
    error
  } = useQuery({
    queryKey: ['admin-registrations', searchTerm, statusFilter, categoryFilter, panchayathFilter, fromDate, toDate, expiryDaysFilter],
    queryFn: async () => {
      console.log('Fetching registrations...');
      let query = supabase.from('registrations').select(`
          *,
          categories (name),
          panchayaths (name, district)
        `).order('created_at', {
        ascending: false
      });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,mobile_number.ilike.%${searchTerm}%,customer_id.ilike.%${searchTerm}%`);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as ApplicationStatus);
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }
      if (panchayathFilter !== 'all') {
        query = query.eq('panchayath_id', panchayathFilter);
      }
      if (fromDate) {
        query = query.gte('created_at', fromDate.toISOString().split('T')[0]);
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching registrations:', error);
        throw error;
      }
      console.log('Fetched registrations:', data);
      
      let filteredData = data as Registration[];
      
      // Apply expiry filter if set
      if (expiryDaysFilter !== null) {
        filteredData = filteredData.filter(reg => {
          if (reg.status === 'pending') {
            const daysRemaining = calculateDaysRemaining(reg.created_at);
            return daysRemaining <= expiryDaysFilter;
          }
          return false;
        });
      }
      
      return filteredData;
    }
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data as Category[];
    }
  });

  // Fetch panchayaths for filter
  const { data: panchayaths } = useQuery({
    queryKey: ['panchayaths'],
    queryFn: async () => {
      const { data, error } = await supabase.from('panchayaths').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase.channel('registrations-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'registrations'
    }, () => {
      console.log('Real-time update received for registrations');
      queryClient.invalidateQueries({
        queryKey: ['admin-registrations']
      });
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: UpdateStatusParams) => {
      console.log('Updating status for registration:', id, 'to:', status);
      
      // Get current admin username
      let adminUsername = 'admin';
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        const sessionData = JSON.parse(adminSession);
        adminUsername = sessionData.username || 'admin';
      }
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };
      
      // Set approved_date and approved_by when status is approved
      if (status === 'approved') {
        updateData.approved_date = new Date().toISOString();
        updateData.approved_by = adminUsername;
      }
      
      // Clear approved_by and approved_date when status is changed to pending
      if (status === 'pending') {
        updateData.approved_by = null;
        updateData.approved_date = null;
      }
      
      // Use match instead of eq to ensure proper where clause
      const { error } = await supabase
        .from('registrations')
        .update(updateData)
        .match({ id });
      
      if (error) {
        console.error('Error updating status:', error);
        throw error;
      }
      console.log('Status updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-registrations']
      });
      toast({
        title: "Status Updated",
        description: "Registration status has been updated successfully."
      });
    },
    onError: error => {
      console.error('Status update failed:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update registration status.",
        variant: "destructive"
      });
    }
  });

  // Delete registration mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting registration:', id);
      const { error } = await supabase.from('registrations').delete().eq('id', id);
      if (error) {
        console.error('Error deleting registration:', error);
        throw error;
      }
      console.log('Registration deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-registrations']
      });
      toast({
        title: "Registration Deleted",
        description: "Registration has been deleted successfully."
      });
    },
    onError: error => {
      console.error('Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete registration.",
        variant: "destructive"
      });
    }
  });

  const handleStatusUpdate = (id: string, status: ApplicationStatus) => {
    console.log('Handle status update called:', id, status, 'canWrite:', permissions.canWrite);
    if (permissions.canWrite) {
      updateStatusMutation.mutate({ id, status });
    } else {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to update registrations.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (id: string) => {
    console.log('Handle delete called:', id, 'canDelete:', permissions.canDelete);
    if (permissions.canDelete) {
      if (window.confirm('Are you sure you want to delete this registration?')) {
        deleteMutation.mutate(id);
      }
    } else {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete registrations.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (registration: Registration) => {
    setEditingRegistration(registration);
    setIsEditDialogOpen(true);
  };

  const handleEditUpdate = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin-registrations']
    });
  };

  const handleBulkApprove = () => {
    if (selectedRows.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select registrations to approve.",
        variant: "destructive"
      });
      return;
    }

    selectedRows.forEach(id => {
      updateStatusMutation.mutate({ id, status: 'approved' });
    });
    setSelectedRows([]);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedRows.length === registrations?.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(registrations?.map(r => r.id) || []);
    }
  };

  const handleExportExcel = () => {
    if (!registrations) return;
    try {
      exportToExcel(registrations);
      toast({
        title: "Export Successful",
        description: "Registrations have been exported to Excel."
      });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export registrations to Excel.",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = () => {
    if (!registrations || registrations.length === 0) {
      toast({
        title: "No Data",
        description: "No registrations available to export.",
        variant: "destructive"
      });
      return;
    }
    try {
      exportToPDF(registrations);
      toast({
        title: "Export Successful",
        description: "Registrations have been exported to PDF."
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: `Failed to export registrations to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const handleExpiryFilter = (days: number) => {
    setExpiryDaysFilter(days);
    setStatusFilter('pending'); // Only pending registrations can expire
    toast({
      title: "Filter Applied",
      description: `Showing registrations expiring within ${days} days.`
    });
  };

  const handleExpiryExportExcel = (days: number) => {
    if (!registrations) return;
    
    const expiringRegistrations = registrations.filter(reg => {
      if (reg.status === 'pending') {
        const daysRemaining = calculateDaysRemaining(reg.created_at);
        return daysRemaining <= days;
      }
      return false;
    });
    
    if (expiringRegistrations.length === 0) {
      toast({
        title: "No Data",
        description: `No registrations found expiring within ${days} days.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      exportToExcel(expiringRegistrations);
      toast({
        title: "Export Successful",
        description: `Exported ${expiringRegistrations.length} registrations expiring within ${days} days.`
      });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export registrations to Excel.",
        variant: "destructive"
      });
    }
  };

  const handleExpiryExportPDF = (days: number) => {
    if (!registrations) return;
    
    const expiringRegistrations = registrations.filter(reg => {
      if (reg.status === 'pending') {
        const daysRemaining = calculateDaysRemaining(reg.created_at);
        return daysRemaining <= days;
      }
      return false;
    });
    
    if (expiringRegistrations.length === 0) {
      toast({
        title: "No Data",
        description: `No registrations found expiring within ${days} days.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      exportToPDF(expiringRegistrations);
      toast({
        title: "Export Successful",
        description: `Exported ${expiringRegistrations.length} registrations expiring within ${days} days.`
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export registrations to PDF.",
        variant: "destructive"
      });
    }
  };

  const clearExpiryFilter = () => {
    setExpiryDaysFilter(null);
    toast({
      title: "Filter Cleared",
      description: "Expiry filter has been cleared."
    });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading registrations: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="text-lg md:text-xl">Registrations Management</CardTitle>
          <div className="flex flex-wrap gap-2">
            <RegistrationsTableHeader
              selectedRows={selectedRows}
              onBulkApprove={handleBulkApprove}
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
              onExpiryFilter={handleExpiryFilter}
              onExpiryExportExcel={handleExpiryExportExcel}
              onExpiryExportPDF={handleExpiryExportPDF}
            />
            {expiryDaysFilter !== null && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <span>Expiring within {expiryDaysFilter} days</span>
                <button
                  onClick={clearExpiryFilter}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <RegistrationsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          panchayathFilter={panchayathFilter}
          setPanchayathFilter={setPanchayathFilter}
          categories={categories}
          panchayaths={panchayaths}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
        />

        {/* Registrations Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 min-w-[800px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === registrations?.length && registrations?.length > 0}
                    onChange={toggleAllSelection}
                    className="mr-2"
                  />
                  Select
                </th>
                <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Customer ID</th>
                <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Name</th>
                <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Mobile</th>
                <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Category</th>
                <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Preference</th>
                <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Status</th>
                <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Fee</th>
                <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Reg. Date</th>
                <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Approved Date</th>
                <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Approved By</th>
                <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Expiry</th>
                <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations?.map(registration => (
                <tr 
                  key={registration.id} 
                  className={`${getCategoryColor(registration.categories?.name, registration.category_id)} transition-colors`}
                >
                  <td className="border border-gray-200 px-2 md:px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(registration.id)}
                      onChange={() => toggleRowSelection(registration.id)}
                    />
                  </td>
                  <td className="border border-gray-200 px-2 md:px-4 py-2 font-mono text-xs md:text-sm">
                    {registration.customer_id}
                  </td>
                  <td className="border border-gray-200 px-2 md:px-4 py-2 text-xs md:text-sm">{registration.name}</td>
                  <td className="border border-gray-200 px-2 md:px-4 py-2 text-xs md:text-sm">{registration.mobile_number}</td>
                  <td className="border border-gray-200 px-2 md:px-4 py-2 font-bold text-gray-900 text-xs md:text-sm">
                    {registration.categories?.name}
                  </td>
                  <td className="border border-gray-200 px-2 md:px-4 py-2 text-xs md:text-sm">
                    {registration.preference || '-'}
                  </td>
                  <td className="border border-gray-200 px-2 md:px-4 py-2">
                    {getStatusBadge(registration.status)}
                  </td>
                  <td className="border border-gray-200 px-2 md:px-4 py-2 text-xs md:text-sm">₹{registration.fee_paid}</td>
                  <td className="border border-gray-200 px-2 md:px-4 py-2 text-xs md:text-sm">
                    {new Date(registration.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="border border-gray-200 px-2 md:px-4 py-2 text-xs md:text-sm">
                    {registration.approved_date 
                      ? new Date(registration.approved_date).toLocaleDateString('en-IN')
                      : '-'
                    }
                  </td>
                  <td className="border border-gray-200 px-2 md:px-4 py-2 text-xs md:text-sm">
                    {registration.approved_by || '-'}
                  </td>
                  <td className="border border-gray-200 px-2 md:px-4 py-2">
                    {registration.status === 'pending' ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        calculateDaysRemaining(registration.created_at) <= 3 
                          ? 'bg-red-100 text-red-800' 
                          : calculateDaysRemaining(registration.created_at) <= 7
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {calculateDaysRemaining(registration.created_at)} days
                      </span>
                    ) : '-'}
                  </td>
                  <td className="border border-gray-200 px-2 md:px-4 py-2">
                    <RegistrationsTableActions
                      registration={registration}
                      permissions={permissions}
                      onStatusUpdate={handleStatusUpdate}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
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

        {!isLoading && (!registrations || registrations.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No registrations found matching your criteria.
          </div>
        )}

        <RegistrationEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          registration={editingRegistration}
          onUpdate={handleEditUpdate}
        />
      </CardContent>
    </Card>
  );
};

export default RegistrationsManagement;
