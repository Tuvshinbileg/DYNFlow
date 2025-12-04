"use client"

import { useState } from 'react';
import type { FormData, ContentTypeResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { contentApi, handleApiError } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Pencil, Loader2 } from 'lucide-react';

interface EditButtonProps {
  contentType: ContentTypeResponse;
  contentData: Record<string, unknown>;
}

export function EditButton({ contentType, contentData }: EditButtonProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(() => {
    // Initialize with existing data
    const initialData: FormData = {};
    contentType.fields.forEach((field) => {
      initialData[field.field_name] = contentData[field.field_name] ?? field.default_value ?? '';
    });
    return initialData;
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (fieldName: string, value: unknown) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contentApi.update(contentData.content_type as string, contentData.id as string, formData);
      
      toast.success(`${contentType.display_name} updated successfully`);

      setOpen(false);
      router.refresh();
    } catch (error) {
      const apiError = handleApiError(error);
      const errorMessage = typeof apiError.error === 'string' 
        ? apiError.error 
        : JSON.stringify(apiError.error);

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: typeof contentType.fields[0]) => {
    const { field_name, display_name, field_type, is_required, help_text, choices, default_value } = field;
    const value = formData[field_name] ?? default_value ?? '';

    const commonProps = {
      id: field_name,
      name: field_name,
      required: is_required,
    };

    switch (field_type) {
      case 'textarea':
        return (
          <div key={field_name} className="space-y-2">
            <Label htmlFor={field_name}>
              {display_name}
              {is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              {...commonProps}
              placeholder={`Enter ${display_name.toLowerCase()}`}
              value={value as string}
              onChange={(e) => handleChange(field_name, e.target.value)}
              className="min-h-20"
            />
            {help_text && (
              <p className="text-xs text-muted-foreground">{help_text}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field_name} className="space-y-2">
            <Label htmlFor={field_name}>
              {display_name}
              {is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type="number"
              placeholder={`Enter ${display_name.toLowerCase()}`}
              value={value as string | number}
              onChange={(e) => handleChange(field_name, e.target.value)}
            />
            {help_text && (
              <p className="text-xs text-muted-foreground">{help_text}</p>
            )}
          </div>
        );

      case 'email':
        return (
          <div key={field_name} className="space-y-2">
            <Label htmlFor={field_name}>
              {display_name}
              {is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type="email"
              placeholder={`Enter ${display_name.toLowerCase()}`}
              value={value as string}
              onChange={(e) => handleChange(field_name, e.target.value)}
            />
            {help_text && (
              <p className="text-xs text-muted-foreground">{help_text}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field_name} className="space-y-2">
            <Label htmlFor={field_name}>
              {display_name}
              {is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <DatePicker
              value={value as string}
              onChange={(dateValue) => handleChange(field_name, dateValue)}
              placeholder={`Select ${display_name.toLowerCase()}`}
            />
            {help_text && (
              <p className="text-xs text-muted-foreground">{help_text}</p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={field_name} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={field_name}
                checked={!!value}
                onCheckedChange={(checked) => handleChange(field_name, checked)}
              />
              <Label htmlFor={field_name} className="cursor-pointer">
                {display_name}
                {is_required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
            {help_text && (
              <p className="text-xs text-muted-foreground">{help_text}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field_name} className="space-y-2">
            <Label htmlFor={field_name}>
              {display_name}
              {is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={String(value)}
              onValueChange={(val) => handleChange(field_name, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${display_name.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {choices?.map((choice: { value: string; label: string }) => (
                  <SelectItem key={choice.value} value={choice.value}>
                    {choice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {help_text && (
              <p className="text-xs text-muted-foreground">{help_text}</p>
            )}
          </div>
        );

      default: // text
        return (
          <div key={field_name} className="space-y-2">
            <Label htmlFor={field_name}>
              {display_name}
              {is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type="text"
              placeholder={`Enter ${display_name.toLowerCase()}`}
              value={value as string}
              onChange={(e) => handleChange(field_name, e.target.value)}
            />
            {help_text && (
              <p className="text-xs text-muted-foreground">{help_text}</p>
            )}
          </div>
        );
    }
  };

  const sortedFields = [...contentType.fields]
    .filter(field => !['id', 'content_type', 'created_at', 'updated_at'].includes(field.field_name));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {contentType.display_name}</DialogTitle>
          <DialogDescription>
            Update the {contentType.display_name.toLowerCase()} details below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {sortedFields.map(field => renderField(field))}
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
