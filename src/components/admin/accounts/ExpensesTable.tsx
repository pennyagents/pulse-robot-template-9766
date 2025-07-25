import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, FileSpreadsheet, FileText } from 'lucide-react';
import { exportExpensesToExcel, exportExpensesToPDF } from './ExportUtils';
import { format } from 'date-fns';

interface Expense {
  id: string;
  amount: number;
  payment_method: 'cash' | 'bank';
  description: string;
  created_at: string;
}

interface ExpensesTableProps {
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    canManageAdmins: boolean;
  };
  onDataChange: () => void;
}

const ExpensesTable: React.FC<ExpensesTableProps> = ({ permissions, onDataChange }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('id, amount, payment_method, description, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setExpenses((data || []) as Expense[]);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!permissions.canManageAdmins) {
      toast({
        title: "Access Denied",
        description: "Only super admins can delete expenses",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });

      loadExpenses();
      onDataChange();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Expenses History</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => exportExpensesToExcel(expenses)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button
              onClick={() => exportExpensesToPDF(expenses)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
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
                <TableHead>Payment Method</TableHead>
                <TableHead>Description</TableHead>
                {permissions.canManageAdmins && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={permissions.canManageAdmins ? 5 : 4} className="text-center py-4">
                    No expenses found
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {format(new Date(expense.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        ₹{expense.amount.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={expense.payment_method === 'cash' ? 'default' : 'secondary'}
                      >
                        {expense.payment_method === 'cash' ? 'Cash' : 'Bank'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {expense.description}
                      </div>
                    </TableCell>
                    {permissions.canManageAdmins && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpensesTable;