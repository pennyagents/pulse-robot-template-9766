import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  cashInHand: number;
  cashAtBank: number;
}

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  cashInHand,
  cashAtBank
}) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const maxAmount = paymentMethod === 'cash' ? cashInHand : cashAtBank;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!remarks.trim()) {
      toast({
        title: "Error",
        description: "Please enter remarks for the expense",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > maxAmount) {
      toast({
        title: "Error",
        description: `Amount cannot exceed available balance (₹${maxAmount.toFixed(2)})`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          description: remarks.trim(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense recorded successfully",
      });

      // Reset form
      setAmount('');
      setPaymentMethod('cash');
      setRemarks('');
      onSuccess();
    } catch (error) {
      console.error('Error recording expense:', error);
      toast({
        title: "Error",
        description: "Failed to record expense",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(value: 'cash' | 'bank') => setPaymentMethod(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">
                  Cash (Available: ₹{cashInHand.toFixed(2)})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank">
                  Bank (Available: ₹{cashAtBank.toFixed(2)})
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks *</Label>
            <Textarea
              id="remarks"
              placeholder="Enter expense description"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;