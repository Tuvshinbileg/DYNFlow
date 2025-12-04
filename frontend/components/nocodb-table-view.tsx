"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { NocoDBColumn, NocoDBRecord } from "@/lib/nocodb";
import { toast } from "sonner";
import { usePrimaryKey } from "@/hooks/use-primary-key";
import { useRecordOperations } from "@/hooks/use-record-operations";
import { TableToolbar } from "./nocodb/table-toolbar";
import { DataTable } from "./nocodb/data-table";
import { TablePagination } from "./nocodb/table-pagination";
import { RecordFormDialog } from "./nocodb/record-form-dialog";
import { DeleteConfirmationDialog } from "./nocodb/delete-confirmation-dialog";

interface NocoDBTableViewProps {
  tableName: string;
  baseId: string;
  initialRecords: NocoDBRecord[];
  columns: NocoDBColumn[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
}

export function NocoDBTableView({
  tableName,
  baseId,
  initialRecords,
  columns,
  totalRows,
  currentPage,
  pageSize,
}: NocoDBTableViewProps) {
  const router = useRouter();
  const [records, setRecords] = useState<NocoDBRecord[]>(initialRecords);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<NocoDBRecord | null>(null);
  const [selectedRecordIndex, setSelectedRecordIndex] = useState<number>(-1);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const totalPages = Math.ceil(totalRows / pageSize);
  
  // Get primary key using custom hook
  const primaryKey = usePrimaryKey(columns, initialRecords);
  
  // Get record operations using custom hook
  const { isLoading, createRecord, updateRecord, deleteRecord } = useRecordOperations(
    baseId,
    tableName,
    primaryKey
  );

  // Filter columns for display and forms
  const systemFieldNames = [
    'created_at', 'createdAt', 'nc_created_at',
    'updated_at', 'updatedAt', 'nc_updated_at',
    'created_by', 'createdBy', 'nc_created_by',
    'updated_by', 'updatedBy', 'nc_updated_by'
  ];
  
  const isSystemField = (col: NocoDBColumn): boolean => {
    return col.system === true || 
           systemFieldNames.includes(col.column_name?.toLowerCase() || '');
  };

  // Filter out system fields and primary key columns for table display
  const visibleColumns = useMemo(
    () => columns.filter((col) => !isSystemField(col) && !col.pk),
    [columns]
  );

  // Filter out system fields, primary key, and auto-increment for forms
  const formColumns = useMemo(
    () => columns.filter((col) => !isSystemField(col) && !col.pk && !col.ai),
    [columns]
  );

  // Event handlers
  const handleRefresh = () => {
    router.refresh();
    toast.success("Table refreshed");
  };

  const handlePageChange = (newPage: number) => {
    const offset = (newPage - 1) * pageSize;
    router.push(`/nocodb/${tableName}?page=${newPage}&offset=${offset}`);
  };

  const handleAdd = () => {
    const initialFormData: Record<string, string> = {};
    formColumns.forEach((col) => {
      initialFormData[col.column_name || ""] = "";
    });
    setFormData(initialFormData);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (record: NocoDBRecord, index: number) => {
    console.log('✏️ Edit button clicked');
    console.log('📋 Record data:', record);
    console.log('🔑 Primary key field:', primaryKey);
    console.log('🆔 Record ID value:', record[primaryKey]);
    
    const editFormData: Record<string, string> = {};
    formColumns.forEach((col) => {
      const key = col.column_name || "";
      editFormData[key] = String(record[key] || "");
    });
    setFormData(editFormData);
    setSelectedRecord(record);
    setSelectedRecordIndex(index);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (record: NocoDBRecord, index: number) => {
    console.log('🗑️ Delete button clicked');
    console.log('📋 Record data:', record);
    console.log('🔑 Primary key field:', primaryKey);
    console.log('🆔 Record ID value:', record[primaryKey]);
    
    setSelectedRecord(record);
    setSelectedRecordIndex(index);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAdd = async () => {
    const newRecord = await createRecord(formData);
    if (newRecord) {
      setRecords([...records, newRecord]);
      console.log('✅ Added new record to local state');
      setIsAddDialogOpen(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedRecord) return;
    
    const success = await updateRecord(selectedRecord, formData);
    if (success && selectedRecordIndex >= 0) {
      const newRecords = [...records];
      newRecords[selectedRecordIndex] = {
        ...selectedRecord,
        ...formData,
      };
      setRecords(newRecords);
      console.log('✅ Updated local record at index:', selectedRecordIndex);
      setIsEditDialogOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;
    
    const success = await deleteRecord(selectedRecord);
    if (success && selectedRecordIndex >= 0) {
      const newRecords = records.filter((_, idx) => idx !== selectedRecordIndex);
      setRecords(newRecords);
      console.log('✅ Removed record from local state at index:', selectedRecordIndex);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <TableToolbar
        onAdd={handleAdd}
        onRefresh={handleRefresh}
        totalRows={totalRows}
      />

      <DataTable
        columns={visibleColumns}
        records={records}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Add Record Dialog */}
      <RecordFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New Record"
        description="Fill in the details to create a new record"
        columns={formColumns}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmitAdd}
        isLoading={isLoading}
        submitLabel="Create"
      />

      {/* Edit Record Dialog */}
      <RecordFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Record"
        description="Update the record details"
        columns={formColumns}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmitEdit}
        isLoading={isLoading}
        submitLabel="Update"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  );
}
