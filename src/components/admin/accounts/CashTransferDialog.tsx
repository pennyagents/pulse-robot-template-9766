import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Share } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { toPng } from 'html-to-image';
import CashReceipt from './CashReceipt';

interface CashTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  maxAmount: number;
}

const CashTransferDialog: React.FC<CashTransferDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  maxAmount
}) => {
  const [amount, setAmount] = useState('');
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);

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

    if (parseFloat(amount) > maxAmount) {
      toast({
        title: "Error",
        description: `Amount cannot exceed cash in hand (₹${maxAmount.toFixed(2)})`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('cash_transactions')
        .insert({
          transaction_type: 'cash_transfer',
          amount: parseFloat(amount),
          from_date: fromDate?.toISOString().split('T')[0],
          to_date: toDate?.toISOString().split('T')[0],
          remarks: remarks || null,
          created_by: 'admin' // This should be replaced with actual admin user
        })
        .select()
        .single();

      if (error) throw error;

      // Store transaction details for receipt
      setLastTransaction({
        id: data.id,
        amount: parseFloat(amount),
        fromDate,
        toDate,
        remarks,
        timestamp: new Date()
      });

      toast({
        title: "Success",
        description: "Cash transfer recorded successfully",
      });

      // Show receipt instead of closing dialog
      setShowReceipt(true);
    } catch (error) {
      console.error('Error recording cash transfer:', error);
      toast({
        title: "Error",
        description: "Failed to record cash transfer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `cash-transfer-receipt-${lastTransaction.id}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Success",
        description: "Receipt downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive",
      });
    }
  };

  const handleShareWhatsApp = async () => {
    if (!receiptRef.current) return;

    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });

      // Convert to blob for sharing
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      if (navigator.share && navigator.canShare({ files: [new File([blob], 'receipt.png', { type: 'image/png' })] })) {
        await navigator.share({
          title: 'Cash Transfer Receipt',
          text: `Cash transfer of ₹${lastTransaction.amount} completed successfully`,
          files: [new File([blob], 'cash-transfer-receipt.png', { type: 'image/png' })]
        });
      } else {
        // Fallback: Open WhatsApp Web with text
        const message = encodeURIComponent(
          `Cash Transfer Receipt\n\nAmount: ₹${lastTransaction.amount}\nDate: ${format(lastTransaction.timestamp, 'dd/MM/yyyy HH:mm')}\nTransaction ID: ${lastTransaction.id}\n\nTransfer completed successfully ✓`
        );
        window.open(`https://wa.me/?text=${message}`, '_blank');
      }

      toast({
        title: "Success",
        description: "Opening WhatsApp to share receipt",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share receipt",
        variant: "destructive",
      });
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setLastTransaction(null);
    // Reset form
    setAmount('');
    setFromDate(undefined);
    setToDate(undefined);
    setRemarks('');
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        {!showReceipt ? (
          <>
            <DialogHeader>
              <DialogTitle>Cash Transfer to Bank</DialogTitle>
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
                <p className="text-sm text-muted-foreground">
                  Available: ₹{maxAmount.toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
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
                        {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
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

                <div className="space-y-2">
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
                        {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
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

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Enter any remarks (optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
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
                  {loading ? 'Processing...' : 'Transfer'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Transfer Receipt</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto max-h-[60vh] p-4">
                <div ref={receiptRef}>
                  <CashReceipt
                    amount={lastTransaction.amount}
                    fromDate={lastTransaction.fromDate}
                    toDate={lastTransaction.toDate}
                    remarks={lastTransaction.remarks}
                    transactionId={lastTransaction.id}
                    timestamp={lastTransaction.timestamp}
                  />
                </div>
              </div>

              <div className="flex-shrink-0 flex justify-center space-x-3 pt-6 pb-2 border-t bg-background/95 backdrop-blur-sm sticky bottom-0">
                <Button
                  variant="outline"
                  onClick={handleDownloadReceipt}
                  className="flex items-center space-x-2 bg-secondary/10 hover:bg-secondary/20"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShareWhatsApp}
                  className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  <Share className="h-4 w-4" />
                  <span>WhatsApp</span>
                </Button>
                <Button onClick={handleCloseReceipt} className="bg-primary">
                  Done
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CashTransferDialog;