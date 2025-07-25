import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BarChart3, TrendingUp, Users, MapPin, DollarSign, Download, FileSpreadsheet, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DateRangeFilter from './reports/DateRangeFilter';
import ActivePanchayathReport from './reports/ActivePanchayathReport';
import { VerifiedRegistrationsExport } from './reports/VerifiedRegistrationsExport';
import { exportToExcel, exportToPDF } from './registrations/exportUtils';
const ReportsManagement = ({
  permissions
}: {
  permissions: any;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isPanchayathReportOpen, setIsPanchayathReportOpen] = useState(false);
  const [isActiveReportOpen, setIsActiveReportOpen] = useState(false);
  const [isCategoryReportOpen, setIsCategoryReportOpen] = useState(false);
  const [showVerificationColumn, setShowVerificationColumn] = useState(true);

  // State for verification management
  const [verifiedRegistrations, setVerifiedRegistrations] = useState<Record<string, { verifiedBy: string; verifiedAt: string }>>({});

  // Fetch approved registrations when date range is selected
  const { data: approvedRegistrations, isLoading: loadingApprovedRegistrations } = useQuery({
    queryKey: ['approved-registrations', startDate, endDate],
    queryFn: async () => {
      if (!startDate && !endDate) return [];
      
      let query = supabase.from('registrations').select(`
        *,
        categories(name),
        registration_verifications(
          id,
          verified_by,
          verified_at
        )
      `).eq('status', 'approved').order('approved_date', { ascending: false });
      
      if (startDate) {
        query = query.gte('approved_date', startDate.toISOString());
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('approved_date', endOfDay.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!(startDate || endDate)
  });

  // Handle verification - store in database
  const handleVerify = async (registrationId: string) => {
    try {
      // Get current admin from localStorage
      const adminSession = localStorage.getItem('adminSession');
      const currentAdmin = adminSession ? JSON.parse(adminSession).username : 'Admin';
      
      const { error } = await supabase
        .from('registration_verifications')
        .insert({
          registration_id: registrationId,
          verified_by: currentAdmin
        });

      if (error) throw error;

      // Refresh the data to show the verification
      toast({
        title: "Verification Successful",
        description: "Registration has been verified successfully."
      });
      
      // Refetch the approved registrations to show updated verification status
      queryClient.invalidateQueries({ queryKey: ['approved-registrations'] });
    } catch (error) {
      console.error('Error verifying registration:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify registration. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle clear verification - remove from database
  const handleClearVerification = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('registration_verifications')
        .delete()
        .eq('registration_id', registrationId);

      if (error) throw error;

      toast({
        title: "Verification Cleared",
        description: "Verification has been cleared successfully."
      });
      
      // Refetch the approved registrations to show updated verification status
      queryClient.invalidateQueries({ queryKey: ['approved-registrations'] });
    } catch (error) {
      console.error('Error clearing verification:', error);
      toast({
        title: "Clear Failed",
        description: "Failed to clear verification. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch registration summary by panchayath
  const {
    data: panchayathSummary,
    isLoading: loadingPanchayath
  } = useQuery({
    queryKey: ['panchayath-summary'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('registrations').select(`
          panchayath_id,
          category_id,
          panchayaths!inner(name, district),
          categories!inner(name)
        `);
      if (error) throw error;

      // Process data to create summary
      const summary = data.reduce((acc, reg) => {
        const panchayathName = reg.panchayaths?.name || 'Unknown';
        const district = reg.panchayaths?.district || 'Unknown';
        const categoryName = reg.categories?.name || 'Unknown';
        const key = `${panchayathName}_${district}`;
        if (!acc[key]) {
          acc[key] = {
            panchayath: panchayathName,
            district: district,
            totalRegistrations: 0,
            categories: {}
          };
        }
        acc[key].totalRegistrations++;
        if (!acc[key].categories[categoryName]) {
          acc[key].categories[categoryName] = 0;
        }
        acc[key].categories[categoryName]++;
        return acc;
      }, {});
      return Object.values(summary);
    }
  });

  // Fetch overall statistics with date filtering
  const {
    data: stats,
    isLoading: loadingStats
  } = useQuery({
    queryKey: ['admin-stats', startDate, endDate],
    queryFn: async () => {
      // Get total registrations with date filtering
      let registrationsQuery = supabase.from('registrations').select('*', {
        count: 'exact',
        head: true
      });
      if (startDate) {
        registrationsQuery = registrationsQuery.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        registrationsQuery = registrationsQuery.lte('created_at', endOfDay.toISOString());
      }
      const [registrationsCount, categoriesCount, panchayathsCount, activeCategories] = await Promise.all([registrationsQuery, supabase.from('categories').select('*', {
        count: 'exact',
        head: true
      }), supabase.from('panchayaths').select('*', {
        count: 'exact',
        head: true
      }), supabase.from('categories').select('*', {
        count: 'exact',
        head: true
      }).eq('is_active', true)]);

      // Calculate total fees collected with date filtering
      let feesQuery = supabase.from('registrations').select('fee_paid, approved_date').eq('status', 'approved');
      if (startDate) {
        feesQuery = feesQuery.gte('approved_date', startDate.toISOString());
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        feesQuery = feesQuery.lte('approved_date', endOfDay.toISOString());
      }
      const approvedFeesData = await feesQuery;
      const totalFeesCollected = approvedFeesData.data?.reduce((sum, reg) => {
        return sum + (reg.fee_paid || 0);
      }, 0) || 0;

      // Calculate pending amount from pending registrations with date filtering
      let pendingQuery = supabase.from('registrations').select('fee_paid').eq('status', 'pending');
      if (startDate) {
        pendingQuery = pendingQuery.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        pendingQuery = pendingQuery.lte('created_at', endOfDay.toISOString());
      }
      const pendingRegistrationsData = await pendingQuery;
      const totalPendingAmount = pendingRegistrationsData.data?.reduce((sum, reg) => {
        return sum + (reg.fee_paid || 0);
      }, 0) || 0;
      return {
        totalRegistrations: registrationsCount.count || 0,
        totalCategories: categoriesCount.count || 0,
        totalPanchayaths: panchayathsCount.count || 0,
        activeCategories: activeCategories.count || 0,
        totalFeesCollected,
        totalPendingAmount
      };
    }
  });

  // Fetch category-wise statistics
  const {
    data: categorySummary,
    isLoading: loadingCategorySummary
  } = useQuery({
    queryKey: ['category-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          fee_paid,
          status,
          categories!inner(name)
        `);
      
      if (error) throw error;

      // Process data to create category summary
      const summary = data.reduce((acc, reg) => {
        const categoryName = reg.categories?.name || 'Unknown';
        
        if (!acc[categoryName]) {
          acc[categoryName] = {
            name: categoryName,
            totalRegistrations: 0,
            totalFeeCollected: 0,
            approvedRegistrations: 0,
            pendingRegistrations: 0
          };
        }
        
        acc[categoryName].totalRegistrations++;
        
        if (reg.status === 'approved') {
          acc[categoryName].approvedRegistrations++;
          acc[categoryName].totalFeeCollected += reg.fee_paid || 0;
        } else if (reg.status === 'pending') {
          acc[categoryName].pendingRegistrations++;
        }
        
        return acc;
      }, {});
      
      return Object.values(summary);
    }
  });

  const handleExportExcel = async () => {
    if (!panchayathSummary) {
      toast({
        title: "Export Failed",
        description: "No data available to export.",
        variant: "destructive"
      });
      return;
    }
    try {
      // Dynamic import to avoid build issues
      const XLSX = await import('xlsx');
      const exportData = panchayathSummary.map((item: any) => ({
        'Panchayath': item.panchayath,
        'District': item.district,
        'Total Registrations': item.totalRegistrations,
        ...Object.entries(item.categories).reduce((acc, [category, count]) => {
          acc[`${category} Count`] = count;
          return acc;
        }, {} as Record<string, any>)
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Panchayath Report');
      XLSX.writeFile(workbook, `panchayath_performance_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast({
        title: "Export Successful",
        description: "Excel file has been downloaded."
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export Excel file.",
        variant: "destructive"
      });
    }
  };
  const handleExportPDF = async () => {
    if (!panchayathSummary || panchayathSummary.length === 0) {
      toast({
        title: "Export Failed",
        description: "No data available to export.",
        variant: "destructive"
      });
      return;
    }
    try {
      console.log('Starting PDF export process...');

      // Dynamic import with proper handling
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;

      // Import autoTable separately
      const autoTableModule = await import('jspdf-autotable');
      console.log('jsPDF and autoTable loaded successfully');
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add title
      doc.setFontSize(16);
      doc.text('Panchayath Performance Report', 14, 15);

      // Add export date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 25);

      // Prepare table data
      const tableData = panchayathSummary.map((item: any) => [item.panchayath || '', item.district || '', item.totalRegistrations || 0, Object.entries(item.categories).map(([cat, count]) => `${cat}: ${count}`).join(', ')]);
      console.log('Table data prepared:', tableData.length, 'rows');

      // Add table using autoTable with proper typing
      (doc as any).autoTable({
        head: [['Panchayath', 'District', 'Total Registrations', 'Category Breakdown']],
        body: tableData,
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: {
            cellWidth: 50
          },
          // Panchayath
          1: {
            cellWidth: 40
          },
          // District
          2: {
            cellWidth: 30
          },
          // Total
          3: {
            cellWidth: 80
          } // Categories
        }
      });

      // Save the PDF
      const fileName = `panchayath_performance_${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Saving PDF as:', fileName);
      doc.save(fileName);
      toast({
        title: "Export Successful",
        description: "PDF file has been downloaded."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF file. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };
  if (!permissions.canRead) {
    return <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            You don't have permission to view reports.
          </div>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-6">
      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <DateRangeFilter 
            startDate={startDate} 
            endDate={endDate} 
            onStartDateChange={setStartDate} 
            onEndDateChange={setEndDate} 
            onClear={handleClearDateFilter}
            showVerificationColumn={showVerificationColumn}
            onToggleVerificationColumn={() => setShowVerificationColumn(!showVerificationColumn)}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Filters Total Registrations, Fee Collection, and Pending Amount
          </p>
          
          {/* Approved Registrations Table when date range is selected */}
          {(startDate || endDate) && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Approved Registrations in Date Range</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      try {
                        // Transform the data to match expected format
                        const registrationsForExport = approvedRegistrations?.map((reg: any) => ({
                          ...reg,
                          panchayaths: reg.panchayaths || { name: '', district: '' },
                          categories: reg.categories || { name: '' }
                        })) || [];
                        exportToExcel(registrationsForExport);
                      } catch (error) {
                        console.error('Excel export failed:', error);
                        toast({
                          title: "Export Failed",
                          description: "Failed to export Excel file.",
                          variant: "destructive"
                        });
                      }
                    }}
                    variant="outline"
                    size="sm"
                    disabled={!approvedRegistrations || approvedRegistrations.length === 0}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Excel
                  </Button>
                  <Button
                    onClick={() => {
                      try {
                        // Transform the data to match expected format
                        const registrationsForExport = approvedRegistrations?.map((reg: any) => ({
                          ...reg,
                          panchayaths: reg.panchayaths || { name: '', district: '' },
                          categories: reg.categories || { name: '' }
                        })) || [];
                        exportToPDF(registrationsForExport);
                      } catch (error) {
                        console.error('PDF export failed:', error);
                        toast({
                          title: "Export Failed",
                          description: "Failed to export PDF file.",
                          variant: "destructive"
                        });
                      }
                    }}
                    variant="outline"
                    size="sm"
                    disabled={!approvedRegistrations || approvedRegistrations.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                  <VerifiedRegistrationsExport 
                    verifiedRegistrations={approvedRegistrations?.filter((reg: any) => 
                      reg.registration_verifications && reg.registration_verifications.length > 0
                    ) || []}
                    dateRange={{ startDate, endDate }}
                  />
                </div>
              </div>
              {loadingApprovedRegistrations ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : approvedRegistrations && approvedRegistrations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-3 py-2 text-left">Name</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Mobile Number</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Category</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Fee Paid</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Approved By</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Approved Date</th>
                        {showVerificationColumn && <th className="border border-gray-200 px-3 py-2 text-left">Verify</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {approvedRegistrations.map((registration: any) => {
                        // Check if this registration is verified from database
                        const verificationRecord = registration.registration_verifications?.[0];
                        const isVerified = !!verificationRecord;
                        
                        return (
                          <tr key={registration.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-3 py-2 font-medium">{registration.name}</td>
                            <td className="border border-gray-200 px-3 py-2">{registration.mobile_number}</td>
                            <td className="border border-gray-200 px-3 py-2">{registration.categories?.name}</td>
                            <td className="border border-gray-200 px-3 py-2">₹{registration.fee_paid?.toLocaleString('en-IN') || 0}</td>
                            <td className="border border-gray-200 px-3 py-2">{registration.approved_by || '-'}</td>
                            <td className="border border-gray-200 px-3 py-2">
                              {registration.approved_date ? new Date(registration.approved_date).toLocaleDateString('en-IN') : '-'}
                            </td>
                            {showVerificationColumn && (
                              <td className="border border-gray-200 px-3 py-2">
                                {isVerified ? (
                                  <div className="space-y-1">
                                    <div className="text-xs text-green-600 font-medium">
                                      Verified by: {verificationRecord.verified_by}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(verificationRecord.verified_at).toLocaleString('en-IN')}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleClearVerification(registration.id)}
                                      className="text-xs px-2 py-1 h-auto"
                                    >
                                      Clear
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleVerify(registration.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-auto"
                                  >
                                    Verify
                                  </Button>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total: {approvedRegistrations.length} approved registrations
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No approved registrations found in the selected date range.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.totalRegistrations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {startDate || endDate ? 'Filtered by date range' : 'All time'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.totalCategories || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {loadingStats ? '...' : stats?.activeCategories || 0} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Panchayaths</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.totalPanchayaths || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-400">
            <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-amber-100">
            <div className="text-2xl font-bold text-green-600">
              ₹{loadingStats ? '...' : (stats?.totalFeesCollected || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              {startDate || endDate ? 'Filtered by date range' : 'All time revenue'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-orange-400">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-orange-100">
            <div className="text-2xl font-bold text-orange-600">
              ₹{loadingStats ? '...' : (stats?.totalPendingAmount || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              {startDate || endDate ? 'Filtered by date range' : 'From pending registrations'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
            <p className="text-xs text-muted-foreground">
              Active registrations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Panchayath Report - Collapsible (Super Admin Only) */}
      {permissions.canManageAdmins && <Collapsible open={isActiveReportOpen} onOpenChange={setIsActiveReportOpen}>
          <Card>
            <CardHeader className="bg-green-200">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto rounded-sm">
                  <div className="flex items-center gap-2">
                    <CardTitle>Active Panchayath Report</CardTitle>
                  </div>
                  {isActiveReportOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <p className="text-sm text-gray-600 text-left">
                Performance grading based on registrations and revenue collection
              </p>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <ActivePanchayathReport />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>}

      {/* Category Performance Report - Collapsible */}
      <Collapsible open={isCategoryReportOpen} onOpenChange={setIsCategoryReportOpen}>
        <Card>
          <CardHeader className="bg-blue-100">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center gap-2">
                  <CardTitle>Category Performance Report</CardTitle>
                </div>
                {isCategoryReportOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <p className="text-sm text-gray-600 text-left mt-2">
              Total fee collected and registration count for each category
            </p>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              {loadingCategorySummary ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Category Name</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Total Registrations</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Approved</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Pending</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Total Fee Collected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorySummary?.map((category: any, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2 font-medium">
                            {category.name}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                              {category.totalRegistrations}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {category.approvedRegistrations}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                              {category.pendingRegistrations}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2 font-medium text-green-600">
                            ₹{category.totalFeeCollected.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loadingCategorySummary && (!categorySummary || categorySummary.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No category data available for reports.
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Panchayath Performance Report - Collapsible */}
      <Collapsible open={isPanchayathReportOpen} onOpenChange={setIsPanchayathReportOpen}>
        <Card>
          <CardHeader className="bg-yellow-100">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center gap-2">
                  <CardTitle>Panchayath Performance Report</CardTitle>
                </div>
                {isPanchayathReportOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <div className="flex gap-2 mt-2">
              <Button onClick={handleExportExcel} variant="outline" size="sm" disabled={loadingPanchayath || !panchayathSummary?.length} className="flex items-center gap-2 text-gray-50 bg-[#049104]">
                <FileSpreadsheet className="h-4 w-4" />
                Export Excel
              </Button>
              <Button onClick={handleExportPDF} variant="outline" size="sm" disabled={loadingPanchayath || !panchayathSummary?.length} className="flex items-center gap-2 text-gray-50 bg-[#ef0233]">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
            <p className="text-sm text-gray-600 text-left mt-2">
              Total registrations and category breakdown for each panchayath
            </p>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              {loadingPanchayath ? <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div> : <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Panchayath</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">District</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Total Registrations</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Category Breakdown</th>
                      </tr>
                    </thead>
                    <tbody>
                      {panchayathSummary?.map((item: any, index) => <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2 font-medium">
                            {item.panchayath}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            {item.district}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                              {item.totalRegistrations}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <div className="space-y-1">
                              {Object.entries(item.categories).map(([category, count]: [string, any]) => <div key={category} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">{category}:</span>
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    {count}
                                  </span>
                                </div>)}
                            </div>
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>}

              {!loadingPanchayath && (!panchayathSummary || panchayathSummary.length === 0) && <div className="text-center py-8 text-gray-500">
                  No registration data available for reports.
                </div>}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>;
};
export default ReportsManagement;