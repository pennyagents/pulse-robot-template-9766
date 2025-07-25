import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  from_date: string | null;
  to_date: string | null;
  remarks: string | null;
  created_at: string;
  created_by: string | null;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  payment_method: string;
  created_at: string;
}

export const exportTransactionsToExcel = (transactions: Transaction[]) => {
  const workbook = XLSX.utils.book_new();
  
  const worksheetData = transactions.map(transaction => ({
    'Transaction ID': transaction.id,
    'Type': transaction.transaction_type,
    'Amount': transaction.amount,
    'From Date': transaction.from_date || 'N/A',
    'To Date': transaction.to_date || 'N/A',
    'Remarks': transaction.remarks || 'N/A',
    'Created At': new Date(transaction.created_at).toLocaleDateString('en-IN'),
    'Created By': transaction.created_by || 'N/A'
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
  XLSX.writeFile(workbook, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportExpensesToExcel = (expenses: Expense[]) => {
  const workbook = XLSX.utils.book_new();
  
  const worksheetData = expenses.map(expense => ({
    'Expense ID': expense.id,
    'Description': expense.description,
    'Amount': expense.amount,
    'Payment Method': expense.payment_method,
    'Created At': new Date(expense.created_at).toLocaleDateString('en-IN')
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
  
  XLSX.writeFile(workbook, `expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportTransactionsToPDF = (transactions: Transaction[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('Cash Transactions Report', 14, 20);
  
  const tableData = transactions.map(transaction => [
    transaction.transaction_type,
    `₹${transaction.amount}`,
    transaction.from_date || 'N/A',
    transaction.to_date || 'N/A',
    transaction.remarks || 'N/A',
    new Date(transaction.created_at).toLocaleDateString('en-IN')
  ]);
  
  (doc as any).autoTable({
    head: [['Type', 'Amount', 'From Date', 'To Date', 'Remarks', 'Created At']],
    body: tableData,
    startY: 30,
    styles: { fontSize: 8 }
  });
  
  doc.save(`transactions_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportExpensesToPDF = (expenses: Expense[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('Expenses Report', 14, 20);
  
  const tableData = expenses.map(expense => [
    expense.description,
    `₹${expense.amount}`,
    expense.payment_method,
    new Date(expense.created_at).toLocaleDateString('en-IN')
  ]);
  
  (doc as any).autoTable({
    head: [['Description', 'Amount', 'Payment Method', 'Created At']],
    body: tableData,
    startY: 30,
    styles: { fontSize: 8 }
  });
  
  doc.save(`expenses_${new Date().toISOString().split('T')[0]}.pdf`);
};