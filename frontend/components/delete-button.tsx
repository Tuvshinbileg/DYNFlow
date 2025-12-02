"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { contentApi, handleApiError } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
  contentTypeName: string;
  contentId: string;
}

export function DeleteButton({ contentTypeName, contentId }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }

    setLoading(true);

    try {
      await contentApi.delete(contentTypeName, contentId);
      
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });

      // Refresh the page to show updated list
      router.refresh();
    } catch (error) {
      const apiError = handleApiError(error);
      const errorMessage = typeof apiError.error === 'string' 
        ? apiError.error 
        : JSON.stringify(apiError.error);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </>
      )}
    </Button>
  );
}
