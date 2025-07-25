
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Edit } from 'lucide-react';
import { Registration, ApplicationStatus, RegistrationsPermissions } from './types';

interface RegistrationsTableActionsProps {
  registration: Registration;
  permissions: RegistrationsPermissions;
  onStatusUpdate: (id: string, status: ApplicationStatus) => void;
  onEdit: (registration: Registration) => void;
  onDelete: (id: string) => void;
}

const RegistrationsTableActions: React.FC<RegistrationsTableActionsProps> = ({
  registration,
  permissions,
  onStatusUpdate,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex gap-2">
      {permissions.canWrite && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(registration)}
        >
          <Edit className="h-3 w-3" />
        </Button>
      )}
      {permissions.canWrite && registration.status === 'pending' && (
        <>
          <Button
            size="sm"
            onClick={() => onStatusUpdate(registration.id, 'approved')}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onStatusUpdate(registration.id, 'rejected')}
          >
            <XCircle className="h-3 w-3" />
          </Button>
        </>
      )}
      {permissions.canDelete && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(registration.id)}
        >
          Delete
        </Button>
      )}
    </div>
  );
};

export default RegistrationsTableActions;
