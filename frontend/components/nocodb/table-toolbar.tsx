"use client";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface TableToolbarProps {
  onAdd: () => void;
  onRefresh: () => void;
  totalRows: number;
}

export function TableToolbar({ onAdd, onRefresh, totalRows }: TableToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {totalRows} total rows
        </span>
      </div>
    </div>
  );
}
