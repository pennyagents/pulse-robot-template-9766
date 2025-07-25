
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useCategoriesManagement } from './categories/useCategoriesManagement';
import CategoryForm from './categories/CategoryForm';
import CategoryTable from './categories/CategoryTable';

const CategoriesManagement = ({ permissions }: { permissions: any }) => {
  const {
    categories,
    isLoading,
    error,
    isDialogOpen,
    setIsDialogOpen,
    editingCategory,
    formData,
    setFormData,
    handleEdit,
    handleDelete,
    handleSubmit,
    openAddDialog
  } = useCategoriesManagement(permissions);

  console.log('CategoriesManagement permissions:', permissions);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading categories: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Categories Management</CardTitle>
          {permissions.canWrite && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <CategoryForm
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                editingCategory={editingCategory}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                permissions={permissions}
              />
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CategoryTable
          categories={categories}
          isLoading={isLoading}
          permissions={permissions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
};

export default CategoriesManagement;
