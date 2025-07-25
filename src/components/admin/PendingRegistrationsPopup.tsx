
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Clock, User, Phone, FileDown, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { exportToExcel, exportToPDF } from '@/components/admin/registrations/exportUtils';
import { Registration } from '@/components/admin/registrations/types';
import { toast } from 'sonner';

interface PendingRegistrationsPopupProps {
  adminSession: any;
  onNavigateToRegistrations: () => void;
}

const PendingRegistrationsPopup = ({ adminSession, onNavigateToRegistrations }: PendingRegistrationsPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Helper function to calculate days remaining for pending registrations
  const calculateDaysRemaining = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 15 - diffDays);
  };

  // Fetch pending registrations expiring in less than 5 days
  const { data: expiringRegistrations } = useQuery({
    queryKey: ['expiring-registrations'],
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
        console.error('Error fetching expiring registrations:', error);
        return [];
      }

      // Filter registrations expiring in less than 5 days
      const expiring = (data as Registration[]).filter(reg => {
        const daysRemaining = calculateDaysRemaining(reg.created_at);
        return daysRemaining <= 5 && daysRemaining > 0;
      });

      return expiring;
    },
    enabled: !!adminSession
  });

  // Check if popup should be shown on every login
  useEffect(() => {
    if (!adminSession || !expiringRegistrations) return;

    // Show popup if there are expiring registrations (on every login)
    if (expiringRegistrations.length > 0) {
      setIsOpen(true);
    }
  }, [expiringRegistrations, adminSession]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleGotItClick = () => {
    setIsOpen(false);
    onNavigateToRegistrations();
  };

  const handleExportExcel = () => {
    if (!expiringRegistrations || expiringRegistrations.length === 0) {
      toast.error('No pending registrations to export');
      return;
    }
    
    try {
      exportToExcel(expiringRegistrations);
      toast.success('Pending registrations exported to Excel successfully');
    } catch (error) {
      console.error('Export to Excel failed:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const handleExportPDF = () => {
    if (!expiringRegistrations || expiringRegistrations.length === 0) {
      toast.error('No pending registrations to export');
      return;
    }
    
    try {
      exportToPDF(expiringRegistrations);
      toast.success('Pending registrations exported to PDF successfully');
    } catch (error) {
      console.error('Export to PDF failed:', error);
      toast.error('Failed to export to PDF');
    }
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 1) return 'bg-red-100 text-red-800 border-red-200';
    if (days <= 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  if (!expiringRegistrations || expiringRegistrations.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-hidden flex flex-col mx-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-4">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-red-600 flex items-center gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Pending Registrations Alert</span>
            <span className="sm:hidden">Expiring Soon</span>
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <div className="mb-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {expiringRegistrations.length} registration(s) expiring within 5 days:
            </p>
          </div>

          <div className="space-y-3">
            {expiringRegistrations.map((registration) => {
              const daysRemaining = calculateDaysRemaining(registration.created_at);
              
              return (
                <div
                  key={registration.id}
                  className="p-3 sm:p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
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
                      className={`${getDaysRemainingColor(daysRemaining)} text-xs whitespace-nowrap flex-shrink-0`}
                    >
                      {daysRemaining === 1 ? '1 day' : `${daysRemaining} days`}
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
            <Button variant="outline" onClick={handleClose} className="flex-1 sm:flex-initial text-xs sm:text-sm">
              Close
            </Button>
            <Button onClick={handleGotItClick} className="flex-1 sm:flex-initial text-xs sm:text-sm">
              Got It
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PendingRegistrationsPopup;
