import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface CashReceiptProps {
  amount: number;
  fromDate?: Date;
  toDate?: Date;
  remarks?: string;
  transactionId: string;
  timestamp: Date;
}

const CashReceipt: React.FC<CashReceiptProps> = ({
  amount,
  fromDate,
  toDate,
  remarks,
  transactionId,
  timestamp
}) => {
  return (
    <Card className="w-full max-w-md mx-auto bg-white border-2 border-primary/20 shadow-lg">
      <CardHeader className="text-center bg-gradient-primary text-white rounded-t-lg">
        <h2 className="text-xl font-bold">CASH TRANSFER RECEIPT</h2>
        <p className="text-sm opacity-90">Bank Transfer Record</p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Transaction ID</p>
          <p className="font-mono text-xs bg-muted p-2 rounded">
            {transactionId.toUpperCase()}
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount Transferred:</span>
            <span className="font-bold text-lg text-primary">₹{amount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Date & Time:</span>
            <span className="font-medium">{format(timestamp, 'dd/MM/yyyy HH:mm')}</span>
          </div>

          {fromDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">From Date:</span>
              <span className="font-medium">{format(fromDate, 'dd/MM/yyyy')}</span>
            </div>
          )}

          {toDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">To Date:</span>
              <span className="font-medium">{format(toDate, 'dd/MM/yyyy')}</span>
            </div>
          )}

          {remarks && (
            <div>
              <p className="text-muted-foreground text-sm">Remarks:</p>
              <p className="text-sm bg-muted p-2 rounded mt-1">{remarks}</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="text-center text-xs text-muted-foreground">
          <p>This is a computer generated receipt</p>
          <p>Generated on {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
        </div>

        <div className="text-center">
          <div className="inline-block bg-primary/10 px-4 py-2 rounded-full">
            <p className="text-sm font-medium text-primary">✓ TRANSFER COMPLETED</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashReceipt;