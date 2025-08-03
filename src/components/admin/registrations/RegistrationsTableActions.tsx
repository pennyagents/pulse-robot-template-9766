
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
  console.log('RegistrationsTableActions rendered for:', registration.customer_id, 'permissions:', permissions);

  const handleEdit = () => {
    console.log('Edit button clicked for registration:', registration.id);
    onEdit(registration);
  };

  const handleApprove = () => {
    console.log('Approve button clicked for registration:', registration.id);
    onStatusUpdate(registration.id, 'approved');
  };

  const handleReject = () => {
    console.log('Reject button clicked for registration:', registration.id);
    onStatusUpdate(registration.id, 'rejected');
  };

  const handleDelete = () => {
    console.log('Delete button clicked for registration:', registration.id);
    onDelete(registration.id);
  };

  return (
    <div className="flex gap-2">
      {permissions.canWrite && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleEdit}
        >
          <Edit className="h-3 w-3" />
        </Button>
      )}
      {permissions.canWrite && registration.status === 'pending' && (
        <>
          <Button
            size="sm"
            onClick={handleApprove}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleReject}
          >
            <XCircle className="h-3 w-3" />
          </Button>
        </>
      )}
      {permissions.canDelete && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleDelete}
        >
          Delete
        </Button>
      )}
    </div>
  );
};

export default RegistrationsTableActions;
