
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Category, CategoryData } from './types';

const initialFormData: CategoryData = {
  name: '',
  description: '',
  warning_message: '',
  actual_fee: '',
  offer_fee: '',
  popup_image_url: '',
  qr_image_url: '',
  is_active: true
};

export const useCategoriesManagement = (permissions: any) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryData>(initialFormData);

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, warning_message, actual_fee, offer_fee, popup_image_url, qr_image_url, preference, is_active, created_at, updated_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Category[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: CategoryData) => {
      const { error } = await supabase
        .from('categories')
        .insert({
          name: data.name,
          description: data.description,
          warning_message: data.warning_message || null,
          actual_fee: parseFloat(data.actual_fee),
          offer_fee: parseFloat(data.offer_fee),
          popup_image_url: data.popup_image_url || null,
          qr_image_url: data.qr_image_url || null,
          is_active: data.is_active
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category created successfully!' });
      setIsDialogOpen(false);
      setFormData(initialFormData);
    },
    onError: (error) => {
      toast({
        title: 'Error creating category',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryData }) => {
      const { error } = await supabase
        .from('categories')
        .update({
          name: data.name,
          description: data.description,
          warning_message: data.warning_message || null,
          actual_fee: parseFloat(data.actual_fee),
          offer_fee: parseFloat(data.offer_fee),
          popup_image_url: data.popup_image_url || null,
          qr_image_url: data.qr_image_url || null,
          is_active: data.is_active
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category updated successfully!' });
      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData(initialFormData);
    },
    onError: (error) => {
      toast({
        title: 'Error updating category',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category deleted successfully!' });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting category',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      warning_message: category.warning_message || '',
      actual_fee: category.actual_fee.toString(),
      offer_fee: category.offer_fee.toString(),
      popup_image_url: category.popup_image_url || '',
      qr_image_url: category.qr_image_url || '',
      is_active: category.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  return {
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
  };
};
