"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { NocoDBColumn } from "@/lib/nocodb";
import { FieldRenderer } from "./field-renderer";

interface RecordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  columns: NocoDBColumn[];
  formData: Record<string, string>;
  onFormDataChange: (data: Record<string, string>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  submitLabel?: string;
}

export function RecordFormDialog({
  open,
  onOpenChange,
  title,
  description,
  columns,
  formData,
  onFormDataChange,
  onSubmit,
  isLoading,
  submitLabel = "Save",
}: RecordFormDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {columns.map((col) => (
              <div key={col.id} className="grid gap-2">
                {col.uidt !== 'Checkbox' && (
                  <Label htmlFor={`field-${col.column_name}`}>
                    {col.title}
                    {col.rqd && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                )}
                <FieldRenderer
                  column={col}
                  value={formData[col.column_name || ""] || ""}
                  onChange={(value) =>
                    onFormDataChange({ ...formData, [col.column_name || ""]: value })
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
