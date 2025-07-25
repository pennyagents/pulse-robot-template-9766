
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface Registration {
  id: string;
  customer_id: string;
  name: string;
  mobile_number: string;
  address: string;
  ward: string;
  agent_pro: string | null;
  status: ApplicationStatus;
  fee_paid: number;
  created_at: string;
  updated_at: string;
  approved_date: string | null;
  approved_by: string | null;
  category_id: string;
  panchayath_id: string | null;
  preference: string | null;
  categories: {
    name: string;
  } | null;
  panchayaths: {
    name: string;
    district: string;
  } | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface UpdateStatusParams {
  id: string;
  status: ApplicationStatus;
}

export interface RegistrationsPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManageAdmins: boolean;
}
