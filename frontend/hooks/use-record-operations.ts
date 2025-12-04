import { useState } from "react";
import { nocodbService, type NocoDBRecord } from "@/lib/nocodb";
import { toast } from "sonner";

export function useRecordOperations(
  baseId: string,
  tableName: string,
  primaryKey: string
) {
  const [isLoading, setIsLoading] = useState(false);

  const getRecordId = (record: NocoDBRecord): string | null => {
    const rawId = record[primaryKey];
    console.log('🆔 Raw ID value:', rawId, '(type:', typeof rawId, ')');
    
    if (rawId === null || rawId === undefined) {
      console.warn('⚠️ Primary key field value is null/undefined, trying alternatives...');
      const alternativeId = record['Id'] || record['ID'] || record['_id'] || record['ncRecordId'];
      if (alternativeId) {
        const id = String(alternativeId);
        console.log('✅ Found alternative ID:', id);
        return id;
      }
      console.error('❌ No valid ID found in record');
      return null;
    }
    
    const recordId = String(rawId);
    if (!recordId || recordId === 'undefined' || recordId === 'null' || recordId.trim() === '') {
      console.error('❌ Invalid record ID after conversion:', recordId);
      return null;
    }
    
    return recordId;
  };

  const createRecord = async (formData: Record<string, string>): Promise<NocoDBRecord | null> => {
    setIsLoading(true);
    try {
      const newRecord = await nocodbService.createRecord(baseId, tableName, formData);
      console.log('✅ Created new record:', newRecord);
      toast.success("Record created successfully");
      return newRecord as NocoDBRecord;
    } catch (error) {
      console.error('❌ Create error:', error);
      toast.error("Failed to create record");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRecord = async (
    record: NocoDBRecord,
    formData: Record<string, string>
  ): Promise<boolean> => {
    if (!primaryKey) {
      toast.error("Cannot edit: Primary key not detected. Check console for details.");
      console.error('❌ Edit failed: No primary key identified');
      return false;
    }

    const recordId = getRecordId(record);
    if (!recordId) {
      toast.error(`Cannot find valid record ID in field "${primaryKey}". Check console for details.`);
      return false;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Updating record - Primary Key:', primaryKey, 'Record ID:', recordId);
      
      // Remove primary key and ID fields from update payload to prevent database errors
      const updatePayload = { ...formData };
      delete updatePayload[primaryKey];
      delete updatePayload['id'];
      delete updatePayload['Id'];
      delete updatePayload['ID'];
      delete updatePayload['_id'];
      
      console.log('📤 Update payload (without ID fields):', updatePayload);
      
      await nocodbService.updateRecord(baseId, tableName, recordId, updatePayload);
      console.log('✅ Record updated successfully');
      toast.success("Record updated successfully");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to update record: ${errorMessage}`);
      console.error('❌ Update error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecord = async (record: NocoDBRecord): Promise<boolean> => {
    if (!primaryKey) {
      toast.error("Cannot delete: Primary key not detected. Check console for details.");
      console.error('❌ Delete failed: No primary key identified');
      return false;
    }

    const recordId = getRecordId(record);
    if (!recordId) {
      toast.error(`Cannot find valid record ID in field "${primaryKey}". Check console for details.`);
      return false;
    }

    setIsLoading(true);
    try {
      console.log('🗑️ Deleting record - Primary Key:', primaryKey, 'Record ID:', recordId);
      
      await nocodbService.deleteRecord(baseId, tableName, recordId);
      console.log('✅ Record deleted successfully');
      toast.success("Record deleted successfully");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to delete record: ${errorMessage}`);
      console.error('❌ Delete error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}
