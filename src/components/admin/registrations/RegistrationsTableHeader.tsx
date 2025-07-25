
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileDown, FileSpreadsheet } from 'lucide-react';
import ExpiryFilterDialog from './ExpiryFilterDialog';

interface RegistrationsTableHeaderProps {
  selectedRows: string[];
  onBulkApprove: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onExpiryFilter: (days: number) => void;
  onExpiryExportExcel: (days: number) => void;
  onExpiryExportPDF: (days: number) => void;
}

const RegistrationsTableHeader: React.FC<RegistrationsTableHeaderProps> = ({
  selectedRows,
  onBulkApprove,
  onExportPDF,
  onExportExcel,
  onExpiryFilter,
  onExpiryExportExcel,
  onExpiryExportPDF
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {selectedRows.length > 0 && (
        <Button
          onClick={onBulkApprove}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
          size="sm"
        >
          <CheckCircle className="h-4 w-4" />
          Bulk Approve ({selectedRows.length})
        </Button>
      )}
      
      <div className="flex items-center gap-2">
        <ExpiryFilterDialog
          onFilter={onExpiryFilter}
          onExportExcel={onExpiryExportExcel}
          onExportPDF={onExpiryExportPDF}
        />
        
        <Button
          onClick={onExportExcel}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span className="hidden sm:inline">Excel</span>
        </Button>
        
        <Button
          onClick={onExportPDF}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <FileDown className="h-4 w-4" />
          <span className="hidden sm:inline">PDF</span>
        </Button>
      </div>
    </div>
  );
};

export default RegistrationsTableHeader;
