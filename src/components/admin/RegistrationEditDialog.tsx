
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Registration {
  id: string;
  customer_id: string;
  name: string;
  mobile_number: string;
  address: string;
  ward: string;
  agent_pro: string | null;
  status: 'pending' | 'approved' | 'rejected';
  fee_paid: number;
  created_at: string;
  updated_at: string;
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

interface Category {
  id: string;
  name: string;
}

interface RegistrationEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  onUpdate: () => void;
}

// Job Card preference options as provided by the user
const JOB_CARD_PREFERENCES = [
  { value: 'farmelife', label: 'Farmelife (കന്നുകാലി വളർത്തൽ)' },
  { value: 'foodelife', label: 'Foodelife (അച്ചാർ പോലുള്ള ഭക്ഷ്യോത്പന്നങ്ങൾ)' },
  { value: 'organelife', label: 'Organelife (കഷിക പദ്ധതികൾ)' },
  { value: 'entrelife', label: 'Entrelife (തയ്യൽ പോലുള്ള കൈതൊഴിലുകൽ)' },
  { value: 'no', label: 'No (പ്രത്യേകം ഇല്ല)' }
];

const RegistrationEditDialog: React.FC<RegistrationEditDialogProps> = ({
  isOpen,
  onClose,
  registration,
  onUpdate
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mobile_number: '',
    ward: '',
    agent_pro: '',
    fee_paid: '',
    category_id: '',
    preference: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected'
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (registration) {
      setFormData({
        name: registration.name,
        address: registration.address,
        mobile_number: registration.mobile_number,
        ward: registration.ward,
        agent_pro: registration.agent_pro || '',
        fee_paid: registration.fee_paid.toString(),
        category_id: registration.category_id,
        preference: registration.preference || '',
        status: registration.status
      });
      
      // Find and set the selected category
      const category = categories.find(cat => cat.id === registration.category_id);
      setSelectedCategory(category || null);
    }
  }, [registration, categories]);

  const handleCategoryChange = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    setSelectedCategory(category || null);
    
    // Fetch category details to get the fee
    if (category) {
      try {
        const { data: categoryData, error } = await supabase
          .from('categories')
          .select('offer_fee')
          .eq('id', categoryId)
          .single();
        
        if (error) throw error;
        
        setFormData(prev => ({ 
          ...prev, 
          category_id: categoryId,
          fee_paid: categoryData.offer_fee.toString(),
          // Clear preference if not Job Card category
          preference: category?.name.toLowerCase().includes('job card') ? prev.preference : ''
        }));
      } catch (error) {
        console.error('Error fetching category fee:', error);
        setFormData(prev => ({ 
          ...prev, 
          category_id: categoryId,
          // Clear preference if not Job Card category
          preference: category?.name.toLowerCase().includes('job card') ? prev.preference : ''
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          name: formData.name,
          address: formData.address,
          mobile_number: formData.mobile_number,
          ward: formData.ward,
          agent_pro: formData.agent_pro || null,
          fee_paid: parseFloat(formData.fee_paid),
          category_id: formData.category_id,
          preference: formData.preference || null,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', registration.id);

      if (error) throw error;

      toast({
        title: "Registration Updated",
        description: "Registration details have been updated successfully."
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating registration:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update registration details.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!registration) return null;

  const isJobCardCategory = selectedCategory?.name.toLowerCase().includes('job card');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Registration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="mobile_number">Mobile Number</Label>
            <Input
              id="mobile_number"
              value={formData.mobile_number}
              onChange={(e) => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="ward">Ward</Label>
            <Input
              id="ward"
              value={formData.ward}
              onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="agent_pro">Agent / P.R.O</Label>
            <Input
              id="agent_pro"
              value={formData.agent_pro}
              onChange={(e) => setFormData(prev => ({ ...prev, agent_pro: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fee_paid">Fee Paid</Label>
            <Input
              id="fee_paid"
              type="number"
              step="0.01"
              value={formData.fee_paid}
              onChange={(e) => setFormData(prev => ({ ...prev, fee_paid: e.target.value }))}
              required
            />
          </div>

          {isJobCardCategory && (
            <div>
              <Label htmlFor="preference">Preference</Label>
              <Select
                value={formData.preference}
                onValueChange={(value) => setFormData(prev => ({ ...prev, preference: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your preference for job card" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {JOB_CARD_PREFERENCES.map((preference) => (
                    <SelectItem key={preference.value} value={preference.value}>
                      {preference.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'pending' | 'approved' | 'rejected' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Updating...' : 'Update Registration'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationEditDialog;
