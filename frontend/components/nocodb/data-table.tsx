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
import { Edit, Trash2 } from "lucide-react";
import type { NocoDBColumn, NocoDBRecord } from "@/lib/nocodb";

interface DataTableProps {
  columns: NocoDBColumn[];
  records: NocoDBRecord[];
  onEdit: (record: NocoDBRecord, index: number) => void;
  onDelete: (record: NocoDBRecord, index: number) => void;
}

export function DataTable({ columns, records, onEdit, onDelete }: DataTableProps) {
  const renderCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.id}>
                {col.title}
                {col.pk && <span className="ml-1 text-xs text-blue-600">(PK)</span>}
              </TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="text-center text-muted-foreground"
              >
                No records found
              </TableCell>
            </TableRow>
          ) : (
            records.map((record, index) => (
              <TableRow key={index}>
                {columns.map((col) => (
                  <TableCell key={col.id}>
                    {renderCellValue(record[col.column_name || ""])}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(record, index)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(record, index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
