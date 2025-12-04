"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Copy } from "lucide-react";
import type { NocoDBColumn, NocoDBRecord } from "@/lib/nocodb";

interface DataTableProps {
  columns: NocoDBColumn[];
  records: NocoDBRecord[];
  onEdit: (record: NocoDBRecord, index: number) => void;
  onDelete: (record: NocoDBRecord, index: number) => void;
}

export function DataTable({ columns, records, onEdit, onDelete }: DataTableProps) {
  const renderCellValue = (col: NocoDBColumn, value: unknown): React.ReactElement | string => {
    // Handle null/undefined
    if (value === null || value === undefined) return <span className="text-muted-foreground">-</span>;
    
    // Handle boolean/checkbox as status indicator
    if (col.uidt === 'Checkbox' || typeof value === 'boolean') {
      const isActive = value === true || value === 'true' || value === 1 || value === '1';
      return (
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm">{isActive ? 'Published' : 'Draft'}</span>
        </div>
      );
    }
    
    // Handle objects
    if (typeof value === "object") return JSON.stringify(value);
    
    // Handle regular values
    return String(value);
  };

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b">
            {columns.map((col) => (
              <TableHead key={col.id} className="h-12 px-4 text-xs font-medium text-gray-500">
                {col.title}
              </TableHead>
            ))}
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length + 1}
                className="h-32 text-center text-sm text-muted-foreground"
              >
                No records found
              </TableCell>
            </TableRow>
          ) : (
            records.map((record, index) => (
              <TableRow 
                key={index} 
                className="border-b hover:bg-gray-50/50 transition-colors"
              >
                {columns.map((col) => (
                  <TableCell key={col.id} className="px-4 py-3 text-sm">
                    {renderCellValue(col, record[col.column_name || ""])}
                  </TableCell>
                ))}
                <TableCell className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onEdit(record, index)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(record, index)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
