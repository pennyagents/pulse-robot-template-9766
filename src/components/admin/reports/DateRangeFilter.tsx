
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onClear: () => void;
  showVerificationColumn?: boolean;
  onToggleVerificationColumn?: () => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  showVerificationColumn = false,
  onToggleVerificationColumn
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium whitespace-nowrap">From:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'dd/MM/yyyy') : 'Start Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate || undefined} onSelect={onStartDateChange} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium whitespace-nowrap">To:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'dd/MM/yyyy') : 'End Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate || undefined} onSelect={onEndDateChange} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onToggleVerificationColumn && (
          <Button
            onClick={onToggleVerificationColumn}
            variant={showVerificationColumn ? "default" : "outline"}
            size="sm"
            className="text-xs sm:text-sm"
          >
            {showVerificationColumn ? "Hide" : "Show"} Verification
          </Button>
        )}
        
        <Button 
          onClick={onClear} 
          variant="outline" 
          size="sm" 
          className="text-zinc-50 bg-rose-600 hover:bg-rose-500 text-xs sm:text-sm"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default DateRangeFilter;
