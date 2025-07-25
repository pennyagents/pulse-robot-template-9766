import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';

interface VerifiedRegistration {
  id: string;
  customer_id: string;
  name: string;
  mobile_number: string;
  address: string;
  ward: string;
  agent_pro?: string;
  preference?: string;
  fee_paid?: number;
  created_at: string;
  approved_date?: string;
  categories?: { name: string };
  panchayaths?: { name: string; district: string };
  registration_verifications?: {
    verified_by: string;
    verified_at: string;
  }[];
}

interface VerifiedRegistrationsExportProps {
  verifiedRegistrations: VerifiedRegistration[];
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
  };
}

const calculateExpiryDate = (createdAt: string): string => {
  const created = new Date(createdAt);
  const expiry = new Date(created);
  expiry.setDate(expiry.getDate() + 15);
  return expiry.toLocaleDateString('en-IN');
};

export const exportVerifiedToExcel = (registrations: VerifiedRegistration[], dateRange?: { startDate?: Date; endDate?: Date }) => {
  if (!registrations || registrations.length === 0) return;
  
  const exportData = registrations.map(reg => ({
    'Customer ID': reg.customer_id,
    'Name': reg.name,
    'Mobile Number': reg.mobile_number,
    'Address': reg.address,
    'Category': reg.categories?.name || '',
    'Panchayath': reg.panchayaths?.name || '',
    'District': reg.panchayaths?.district || '',
    'Ward': reg.ward,
    'Agent/PRO': reg.agent_pro || '',
    'Preference': reg.preference || '',
    'Fee Paid': reg.fee_paid || 0,
    'Applied Date': new Date(reg.created_at).toLocaleDateString('en-IN'),
    'Approved Date': reg.approved_date ? new Date(reg.approved_date).toLocaleDateString('en-IN') : '',
    'Expires On': calculateExpiryDate(reg.created_at),
    'Verified By': reg.registration_verifications?.[0]?.verified_by || '',
    'Verified At': reg.registration_verifications?.[0]?.verified_at 
      ? new Date(reg.registration_verifications[0].verified_at).toLocaleDateString('en-IN') + ' ' + 
        new Date(reg.registration_verifications[0].verified_at).toLocaleTimeString('en-IN')
      : ''
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Verified Registrations');
  
  const dateRangeStr = dateRange?.startDate && dateRange?.endDate 
    ? `_${dateRange.startDate.toISOString().split('T')[0]}_to_${dateRange.endDate.toISOString().split('T')[0]}`
    : '';
  
  XLSX.writeFile(workbook, `verified_registrations${dateRangeStr}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportVerifiedToPDF = (registrations: VerifiedRegistration[], dateRange?: { startDate?: Date; endDate?: Date }) => {
  if (!registrations || registrations.length === 0) {
    throw new Error('No verified registrations available to export');
  }
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Add title
  doc.setFontSize(16);
  doc.text('Verified Registrations Report', 14, 15);

  // Add date range if provided
  if (dateRange?.startDate && dateRange?.endDate) {
    doc.setFontSize(10);
    doc.text(
      `Date Range: ${dateRange.startDate.toLocaleDateString('en-IN')} to ${dateRange.endDate.toLocaleDateString('en-IN')}`, 
      14, 25
    );
  }

  // Add export date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, dateRange?.startDate ? 32 : 25);

  // Prepare table data
  const tableData = registrations.map(reg => [
    reg.customer_id || '',
    reg.name || '',
    reg.mobile_number || '',
    reg.categories?.name || '',
    reg.panchayaths?.name || '',
    `₹${reg.fee_paid || 0}`,
    new Date(reg.created_at).toLocaleDateString('en-IN'),
    reg.registration_verifications?.[0]?.verified_by || '',
    reg.registration_verifications?.[0]?.verified_at 
      ? new Date(reg.registration_verifications[0].verified_at).toLocaleDateString('en-IN')
      : ''
  ]);

  // Add table using autoTable
  autoTable(doc, {
    head: [['Customer ID', 'Name', 'Mobile', 'Category', 'Panchayath', 'Fee', 'Applied Date', 'Verified By', 'Verified Date']],
    body: tableData,
    startY: dateRange?.startDate ? 40 : 35,
    styles: {
      fontSize: 7,
      cellPadding: 1.5
    },
    headStyles: {
      fillColor: [34, 197, 94], // Green color for verified data
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 22 }, // Customer ID
      1: { cellWidth: 30 }, // Name
      2: { cellWidth: 22 }, // Mobile
      3: { cellWidth: 25 }, // Category
      4: { cellWidth: 25 }, // Panchayath
      5: { cellWidth: 18 }, // Fee
      6: { cellWidth: 22 }, // Applied Date
      7: { cellWidth: 20 }, // Verified By
      8: { cellWidth: 22 }  // Verified Date
    }
  });

  // Save the PDF
  const dateRangeStr = dateRange?.startDate && dateRange?.endDate 
    ? `_${dateRange.startDate.toISOString().split('T')[0]}_to_${dateRange.endDate.toISOString().split('T')[0]}`
    : '';
  
  const fileName = `verified_registrations${dateRangeStr}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const VerifiedRegistrationsExport: React.FC<VerifiedRegistrationsExportProps> = ({ 
  verifiedRegistrations, 
  dateRange 
}) => {
  const handleExportExcel = () => {
    exportVerifiedToExcel(verifiedRegistrations, dateRange);
  };

  const handleExportPDF = () => {
    try {
      exportVerifiedToPDF(verifiedRegistrations, dateRange);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  if (!verifiedRegistrations || verifiedRegistrations.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleExportExcel}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export Excel
      </Button>
      <Button
        onClick={handleExportPDF}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export PDF
      </Button>
    </div>
  );
};