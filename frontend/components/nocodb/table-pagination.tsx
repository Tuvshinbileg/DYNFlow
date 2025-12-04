"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalRows: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ 
  currentPage, 
  totalPages, 
  totalRows,
  pageSize,
  onPageChange 
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const startRow = (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows);

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="text-sm text-muted-foreground">
        {startRow} - {endRow} of {totalRows} results
      </div>
      <div className="flex items-center gap-6">
        <div className="text-sm text-muted-foreground">
          {currentPage} of {totalPages} pages
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 px-3"
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 px-3"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
