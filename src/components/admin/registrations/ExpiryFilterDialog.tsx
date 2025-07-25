
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, FileDown, FileSpreadsheet } from 'lucide-react';

interface ExpiryFilterDialogProps {
  onFilter: (days: number) => void;
  onExportExcel: (days: number) => void;
  onExportPDF: (days: number) => void;
}

const ExpiryFilterDialog: React.FC<ExpiryFilterDialogProps> = ({
  onFilter,
  onExportExcel,
  onExportPDF
}) => {
  const [days, setDays] = useState<number>(7);
  const [isOpen, setIsOpen] = useState(false);

  const handleFilter = () => {
    onFilter(days);
    setIsOpen(false);
  };

  const handleExportExcel = () => {
    onExportExcel(days);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    onExportPDF(days);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Expiry Filter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter by Expiry Days</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="days">Days until expiry</Label>
            <Input
              id="days"
              type="number"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 0)}
              min="0"
              max="15"
              placeholder="Enter number of days"
            />
            <p className="text-sm text-gray-500 mt-1">
              Show registrations that expire within the specified number of days
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button onClick={handleFilter} className="w-full">
              Apply Filter
            </Button>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleExportExcel}
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button 
                onClick={handleExportPDF}
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpiryFilterDialog;
