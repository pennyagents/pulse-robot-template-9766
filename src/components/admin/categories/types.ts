
export interface CategoryData {
  name: string;
  description: string;
  warning_message: string;
  actual_fee: string;
  offer_fee: string;
  popup_image_url: string;
  qr_image_url: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  warning_message: string | null;
  actual_fee: number;
  offer_fee: number;
  popup_image_url: string | null;
  qr_image_url: string | null;
  preference: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
