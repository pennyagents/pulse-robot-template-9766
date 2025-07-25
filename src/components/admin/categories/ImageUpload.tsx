import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, ExternalLink } from 'lucide-react';

interface ImageUploadProps {
  bucketName: string;
  currentUrl: string;
  onUrlChange: (url: string) => void;
  label: string;
  accept?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  bucketName,
  currentUrl,
  onUrlChange,
  label,
  accept = "image/*"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      onUrlChange(urlData.publicUrl);
      
      toast({
        title: "Upload Successful",
        description: "Image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    onUrlChange('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          type="url"
          value={currentUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg or upload below"
          className="flex-1"
        />
        {currentUrl && (
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(currentUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept={accept}
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
          id={`upload-${bucketName}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById(`upload-${bucketName}`)?.click()}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </div>

      {/* Preview */}
      {currentUrl && (
        <div className="mt-2">
          <img
            src={currentUrl}
            alt="Preview"
            className="max-w-xs max-h-32 object-contain border rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;