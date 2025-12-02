"use client"

import React, { useState } from 'react';
import type { FormField, ContentType, FormData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { contentApi, handleApiError } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface DynamicFormProps {
  contentType: ContentType;
  onSuccess?: () => void;
}

export function DynamicForm({ contentType, onSuccess }: DynamicFormProps) {
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await contentApi.create(contentType.name, formData);
      
      toast({
        title: "Success!",
        description: `${contentType.display_name} created successfully`,
      });

      // Reset form
      setFormData({});
      
      // Reset form elements
      const form = e.target as HTMLFormElement;
      form.reset();

      if (onSuccess) {
        onSuccess();
      }
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

  const renderField = (field: FormField) => {
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
              value={value}
              onChange={(e) => handleChange(field_name, e.target.value)}
              className="min-h-[100px]"
            />
            {help_text && (
              <p className="text-sm text-muted-foreground">{help_text}</p>
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
              value={value}
              onChange={(e) => handleChange(field_name, e.target.value)}
            />
            {help_text && (
              <p className="text-sm text-muted-foreground">{help_text}</p>
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
              value={value}
              onChange={(e) => handleChange(field_name, e.target.value)}
            />
            {help_text && (
              <p className="text-sm text-muted-foreground">{help_text}</p>
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
            <Input
              {...commonProps}
              type="date"
              value={value}
              onChange={(e) => handleChange(field_name, e.target.value)}
            />
            {help_text && (
              <p className="text-sm text-muted-foreground">{help_text}</p>
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
              <p className="text-sm text-muted-foreground">{help_text}</p>
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
              value={value}
              onValueChange={(val) => handleChange(field_name, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${display_name.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {choices?.map((choice) => (
                  <SelectItem key={choice} value={choice}>
                    {choice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {help_text && (
              <p className="text-sm text-muted-foreground">{help_text}</p>
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
              value={value}
              onChange={(e) => handleChange(field_name, e.target.value)}
            />
            {help_text && (
              <p className="text-sm text-muted-foreground">{help_text}</p>
            )}
          </div>
        );
    }
  };

  const sortedFields = [...contentType.fields].sort((a, b) => a.order - b.order);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sortedFields.map(field => renderField(field))}
      
      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Creating...' : `Create ${contentType.display_name}`}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => {
            setFormData({});
            const form = document.querySelector('form') as HTMLFormElement;
            form?.reset();
          }}
          disabled={loading}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
