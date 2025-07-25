
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, X, Clock, User, Phone, FileDown, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { exportToExcel, exportToPDF } from '@/components/admin/registrations/exportUtils';
import { Registration } from '@/components/admin/registrations/types';
import { toast } from 'sonner';

interface ExpiredRegistrationsNotificationProps {
  adminSession: any;
}

const ExpiredRegistrationsNotification = ({ adminSession }: ExpiredRegistrationsNotificationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch expired registrations (older than 15 days)
  const { data: expiredRegistrations } = useQuery({
    queryKey: ['expired-registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          customer_id,
          name,
          mobile_number,
          address,
          ward,
          agent_pro,
          status,
          fee_paid,
          created_at,
          updated_at,
          approved_date,
          approved_by,
          category_id,
          panchayath_id,
          preference,
          categories (name),
          panchayaths (name, district)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching expired registrations:', error);
        return [];
      }

      // Filter registrations that are expired (older than 15 days)
      const expired = (data as Registration[]).filter(reg => {
        const created = new Date(reg.created_at);
        const now = new Date();
        const diffTime = now.getTime() - created.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 15;
      });

      return expired;
    },
    enabled: !!adminSession
  });

  const handleExportExcel = () => {
    if (!expiredRegistrations || expiredRegistrations.length === 0) {
      toast.error('No expired registrations to export');
      return;
    }
    
    try {
      exportToExcel(expiredRegistrations);
      toast.success('Expired registrations exported to Excel successfully');
    } catch (error) {
      console.error('Export to Excel failed:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const handleExportPDF = () => {
    if (!expiredRegistrations || expiredRegistrations.length === 0) {
      toast.error('No expired registrations to export');
      return;
    }
    
    try {
      exportToPDF(expiredRegistrations);
      toast.success('Expired registrations exported to PDF successfully');
    } catch (error) {
      console.error('Export to PDF failed:', error);
      toast.error('Failed to export to PDF');
    }
  };

  const getDaysExpired = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays - 15);
  };

  if (!expiredRegistrations || expiredRegistrations.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-red-50"
      >
        <Bell className="h-5 w-5 text-red-600" />
        {expiredRegistrations.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {expiredRegistrations.length}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-hidden flex flex-col mx-auto">
          <DialogHeader className="flex flex-row items-center justify-between pb-4">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-red-600 flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Expired Registrations</span>
              <span className="sm:hidden">Expired</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            <div className="mb-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {expiredRegistrations.length} registration(s) have expired (older than 15 days):
              </p>
            </div>

            <div className="space-y-3">
              {expiredRegistrations.map((registration) => {
                const daysExpired = getDaysExpired(registration.created_at);
                
                return (
                  <div
                    key={registration.id}
                    className="p-3 sm:p-4 border rounded-lg bg-red-50 hover:bg-red-100 transition-colors border-l-4 border-l-red-500"
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">{registration.name}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{registration.mobile_number}</span>
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-red-100 text-red-800 border-red-200 text-xs whitespace-nowrap flex-shrink-0"
                      >
                        {daysExpired} days expired
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-medium">ID:</span>
                        <p className="text-muted-foreground truncate">{registration.customer_id}</p>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <p className="text-muted-foreground truncate">{registration.categories?.name || 'N/A'}</p>
                      </div>
                      {registration.panchayaths && (
                        <div className="col-span-1 sm:col-span-2">
                          <span className="font-medium">Location:</span>
                          <p className="text-muted-foreground truncate">
                            {registration.panchayaths.name}, {registration.panchayaths.district}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      Created: {new Date(registration.created_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t gap-3">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="flex items-center gap-1 flex-1 sm:flex-initial"
              >
                <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Excel</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="flex items-center gap-1 flex-1 sm:flex-initial"
              >
                <FileDown className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">PDF</span>
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1 sm:flex-initial text-xs sm:text-sm">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpiredRegistrationsNotification;
