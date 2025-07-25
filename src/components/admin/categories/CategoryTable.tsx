import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Image } from 'lucide-react';
import { Category } from './types';

interface CategoryTableProps {
  categories: Category[] | undefined;
  isLoading: boolean;
  permissions: any;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  isLoading,
  permissions,
  onEdit,
  onDelete
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No categories found. Create your first category to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Actual Fee</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Offer Fee</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Discount</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Image</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2 font-medium">
                {category.name}
              </td>
              <td className="border border-gray-200 px-4 py-2">₹{category.actual_fee}</td>
              <td className="border border-gray-200 px-4 py-2">₹{category.offer_fee}</td>
              <td className="border border-gray-200 px-4 py-2">
                {Math.round(((category.actual_fee - category.offer_fee) / category.actual_fee) * 100)}%
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  category.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                {category.popup_image_url ? (
                  <Image className="h-4 w-4 text-blue-600" />
                ) : (
                  <span className="text-gray-400">No image</span>
                )}
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex gap-2">
                  {permissions.canWrite && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(category)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  {permissions.canDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(category.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;