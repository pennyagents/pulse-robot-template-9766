
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Calendar, Upload, X, ExternalLink, Image } from 'lucide-react';
import ImageUpload from '@/components/admin/categories/ImageUpload';

interface AnnouncementData {
  title: string;
  content: string;
  expiry_date: string | null;
  is_active: boolean;
  youtube_video_url: string | null;
  poster_image_url: string | null;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  expiry_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  youtube_video_url: string | null;
  poster_image_url: string | null;
}

const AnnouncementsManagement = ({ permissions }: { permissions: any }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementData>({
    title: '',
    content: '',
    expiry_date: null,
    is_active: true,
    youtube_video_url: null,
    poster_image_url: null
  });

  // Fetch announcements
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Announcement[];
    }
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Create/Update announcement mutation
  const saveAnnouncementMutation = useMutation({
    mutationFn: async (announcementData: AnnouncementData) => {
      const dataToSave = {
        ...announcementData,
        expiry_date: announcementData.expiry_date || null
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAnnouncement.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([dataToSave]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      setIsDialogOpen(false);
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        expiry_date: null,
        is_active: true,
        youtube_video_url: null,
        poster_image_url: null
      });
      toast({
        title: editingAnnouncement ? "Announcement Updated" : "Announcement Created",
        description: `Announcement has been ${editingAnnouncement ? 'updated' : 'created'} successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Operation Failed",
        description: "Failed to save announcement. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast({
        title: "Announcement Deleted",
        description: "Announcement has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      expiry_date: announcement.expiry_date ? 
        new Date(announcement.expiry_date).toISOString().split('T')[0] : null,
      is_active: announcement.is_active,
      youtube_video_url: announcement.youtube_video_url,
      poster_image_url: announcement.poster_image_url
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (permissions.canDelete) {
      if (window.confirm('Are you sure you want to delete this announcement?')) {
        deleteAnnouncementMutation.mutate(id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (permissions.canWrite) {
      saveAnnouncementMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      expiry_date: null,
      is_active: true,
      youtube_video_url: null,
      poster_image_url: null
    });
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Announcements Management</CardTitle>
          {permissions.canWrite && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div>
                    <ImageUpload
                      bucketName="announcement-posters"
                      currentUrl={formData.poster_image_url || ''}
                      onUrlChange={(url) => setFormData(prev => ({ ...prev, poster_image_url: url }))}
                      label="Poster/Picture (Optional)"
                      accept="image/*"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="youtube_video_url">YouTube Video URL (Optional)</Label>
                    <Input
                      id="youtube_video_url"
                      type="url"
                      value={formData.youtube_video_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, youtube_video_url: e.target.value || null }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={formData.expiry_date || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value || null }))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingAnnouncement ? 'Update' : 'Create'} Announcement
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements?.map((announcement) => (
            <Card key={announcement.id} className={`${
              !announcement.is_active || isExpired(announcement.expiry_date) 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          announcement.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {announcement.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {isExpired(announcement.expiry_date) && (
                          <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{announcement.content}</p>
                    
                    {/* Display poster image if available */}
                    {announcement.poster_image_url && (
                      <div className="mb-3">
                        <img
                          src={announcement.poster_image_url}
                          alt={`${announcement.title} poster`}
                          className="max-w-sm max-h-32 object-contain border rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Created: {new Date(announcement.created_at).toLocaleDateString('en-IN')}</span>
                      {announcement.expiry_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(announcement.expiry_date).toLocaleDateString('en-IN')}
                        </span>
                      )}
                      {announcement.poster_image_url && (
                        <span className="flex items-center gap-1">
                          <Image className="h-3 w-3" />
                          Poster
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {permissions.canWrite && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {permissions.canDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!isLoading && (!announcements || announcements.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No announcements found. Create your first announcement to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementsManagement;
