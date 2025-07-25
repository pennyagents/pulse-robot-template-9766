
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Category, CategoryData } from './types';
import ImageUpload from './ImageUpload';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Category | null;
  formData: CategoryData;
  setFormData: React.Dispatch<React.SetStateAction<CategoryData>>;
  onSubmit: (e: React.FormEvent) => void;
  permissions: any;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  onClose,
  editingCategory,
  formData,
  setFormData,
  onSubmit,
  permissions
}) => {
  if (!permissions.canWrite) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description & Tips</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add important tips and description for this category..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="warning_message">Warning Message</Label>
            <Textarea
              id="warning_message"
              value={formData.warning_message}
              onChange={(e) => setFormData(prev => ({ ...prev, warning_message: e.target.value }))}
              placeholder="Add a warning message that will appear when users try to register for this category..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="actual_fee">Actual Fee (₹)</Label>
              <Input
                id="actual_fee"
                type="number"
                step="0.01"
                value={formData.actual_fee}
                onChange={(e) => setFormData(prev => ({ ...prev, actual_fee: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="offer_fee">Offer Fee (₹)</Label>
              <Input
                id="offer_fee"
                type="number"
                step="0.01"
                value={formData.offer_fee}
                onChange={(e) => setFormData(prev => ({ ...prev, offer_fee: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <ImageUpload
            bucketName="popup-images"
            currentUrl={formData.popup_image_url}
            onUrlChange={(url) => setFormData(prev => ({ ...prev, popup_image_url: url }))}
            label="Popup Image"
            accept="image/*"
          />
          
          <ImageUpload
            bucketName="qr-codes"
            currentUrl={formData.qr_image_url}
            onUrlChange={(url) => setFormData(prev => ({ ...prev, qr_image_url: url }))}
            label="QR Code Image"
            accept="image/*"
          />
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingCategory ? 'Update' : 'Create'} Category
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryForm;
