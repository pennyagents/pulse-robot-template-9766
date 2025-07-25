import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Category } from './types';

interface RegistrationsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  panchayathFilter: string;
  setPanchayathFilter: (value: string) => void;
  categories: Category[] | undefined;
  panchayaths: any[] | undefined;
  fromDate?: Date;
  setFromDate: (date: Date | undefined) => void;
  toDate?: Date;
  setToDate: (date: Date | undefined) => void;
}

const RegistrationsFilters: React.FC<RegistrationsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  panchayathFilter,
  setPanchayathFilter,
  categories,
  panchayaths,
  fromDate,
  setFromDate,
  toDate,
  setToDate
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* First row: Search and Status/Category/Panchayath filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, mobile, or customer ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={panchayathFilter} onValueChange={setPanchayathFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by panchayath" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Panchayaths</SelectItem>
            {panchayaths?.map(panchayath => (
              <SelectItem key={panchayath.id} value={panchayath.id}>
                {panchayath.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Second row: Date filters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>From Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !fromDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "PPP") : <span>Select from date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>To Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !toDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "PPP") : <span>Select to date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Clear date filters button */}
      {(fromDate || toDate) && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setFromDate(undefined);
              setToDate(undefined);
            }}
          >
            Clear Date Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default RegistrationsFilters;