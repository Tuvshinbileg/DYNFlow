"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Upload, Download, SlidersHorizontal } from "lucide-react";

interface TableToolbarProps {
  onAdd: () => void;
  onRefresh: () => void;
  totalRows: number;
  tableName: string;
}

export function TableToolbar({ onAdd, onRefresh, totalRows, tableName }: TableToolbarProps) {
  return (
    <div className="space-y-4">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{tableName}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={onAdd} size="sm">
            Create
          </Button>
        </div>
      </div>

      {/* Filter and search bar */}
      {/* <div className="flex items-center justify-between gap-4">
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Add filter
        </Button>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-9"
          />
        </div>
      </div> */}
    </div>
  );
}
