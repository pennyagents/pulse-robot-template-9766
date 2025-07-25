import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, FileSpreadsheet, FileText } from 'lucide-react';
import { exportTransactionsToExcel, exportTransactionsToPDF } from './ExportUtils';
import { format } from 'date-fns';
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
interface TransactionsTableProps {
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    canManageAdmins: boolean;
  };
  onDataChange: () => void;
}
const TransactionsTable: React.FC<TransactionsTableProps> = ({
  permissions,
  onDataChange
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadTransactions();
  }, []);
  const loadTransactions = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('cash_transactions').select('*').eq('transaction_type', 'cash_transfer').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load cash transfers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!permissions.canManageAdmins) {
      toast({
        title: "Access Denied",
        description: "Only super admins can delete transactions",
        variant: "destructive"
      });
      return;
    }
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    try {
      const {
        error
      } = await supabase.from('cash_transactions').delete().eq('id', id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Transaction deleted successfully"
      });
      loadTransactions();
      onDataChange();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Cash Transfer History</CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => exportTransactionsToExcel(transactions)} variant="outline" size="sm" className="flex items-center gap-2 bg-green-900 hover:bg-green-800 text-zinc-50">
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button onClick={() => exportTransactionsToPDF(transactions)} variant="outline" size="sm" className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-slate-50">
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Created By</TableHead>
                {permissions.canManageAdmins && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? <TableRow>
                  <TableCell colSpan={permissions.canManageAdmins ? 6 : 5} className="text-center py-4">
                    No cash transfers found
                  </TableCell>
                </TableRow> : transactions.map(transaction => <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        ₹{transaction.amount.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.from_date && transaction.to_date ? <span className="text-sm">
                          {format(new Date(transaction.from_date), 'dd/MM/yyyy')} - {' '}
                          {format(new Date(transaction.to_date), 'dd/MM/yyyy')}
                        </span> : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {transaction.remarks || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.created_by || 'System'}
                    </TableCell>
                    {permissions.canManageAdmins && <TableCell>
                        <div className="flex gap-2">
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(transaction.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>}
                  </TableRow>)}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>;
};
export default TransactionsTable;