import { useMemo } from "react";
import type { NocoDBColumn, NocoDBRecord } from "@/lib/nocodb";

export function usePrimaryKey(columns: NocoDBColumn[], records: NocoDBRecord[]) {
  return useMemo(() => {
    // Find primary key from ALL columns (not filtered)
    const primaryKeyColumn = columns.find((col) => col.pk);
    let primaryKey = primaryKeyColumn?.column_name || "";
    
    console.log('🔍 Primary key from column metadata:', primaryKey);
    console.log('📋 All columns:', columns.map(c => ({ name: c.column_name, pk: c.pk, title: c.title })));
    console.log('📦 Sample record structure:', records.length > 0 ? records[0] : 'No records');
    console.log('📦 All record keys:', records.length > 0 ? Object.keys(records[0]) : 'No records');
    
    // If no primary key found, try common NocoDB field names from records
    if (!primaryKey && records.length > 0) {
      const firstRecord = records[0];
      console.log('🔍 Attempting to detect primary key from record keys:', Object.keys(firstRecord));
      
      // NocoDB typically uses 'Id' (capital I) or other variations
      const possibleKeys = ['Id', 'id', 'ID', '_id', 'nc_id', 'ncRecordId', 'recordId'];
      
      for (const key of possibleKeys) {
        const value = firstRecord[key];
        if (key in firstRecord && value !== null && value !== undefined && String(value).trim() !== '') {
          primaryKey = key;
          console.log(`✅ Using detected primary key: ${primaryKey} (value: ${value}, type: ${typeof value})`);
          break;
        }
      }
      
      // If still not found, try to find any field with 'id' in the name
      if (!primaryKey) {
        const idField = Object.keys(firstRecord).find(key => {
          const value = firstRecord[key];
          return key.toLowerCase().includes('id') && 
                 value !== null && 
                 value !== undefined && 
                 String(value).trim() !== '';
        });
        if (idField) {
          primaryKey = idField;
          console.log(`✅ Using detected ID field: ${primaryKey} (value: ${firstRecord[primaryKey]}, type: ${typeof firstRecord[primaryKey]})`);
        }
      }
    }
    
    // Additional validation: if primary key is detected but the value is empty/invalid, try to fix it
    if (primaryKey && records.length > 0) {
      const testValue = records[0][primaryKey];
      if (testValue === null || testValue === undefined || String(testValue).trim() === '') {
        console.warn(`⚠️ Detected primary key "${primaryKey}" but first record has invalid value:`, testValue);
        console.warn('⚠️ Trying to find a better primary key field...');
        
        // Try to find ANY field with a valid value that looks like an ID
        const betterKey = Object.keys(records[0]).find(key => {
          const value = records[0][key];
          return value !== null && 
                 value !== undefined && 
                 String(value).trim() !== '' &&
                 (key.toLowerCase().includes('id') || typeof value === 'number');
        });
        
        if (betterKey) {
          console.log(`✅ Found better primary key: ${betterKey} (value: ${records[0][betterKey]})`);
          primaryKey = betterKey;
        }
      }
    }
    
    // Final check and logging
    if (!primaryKey) {
      console.error('❌ No primary key found!');
      console.error('📋 Available columns:', columns.map(c => c.column_name).join(', '));
      console.error('📋 First record keys:', records[0] ? Object.keys(records[0]).join(', ') : 'No records');
      console.error('💡 Tip: Check if your table has a primary key defined in NocoDB');
    } else {
      console.log(`✅ Final primary key: "${primaryKey}"`);
      if (records.length > 0) {
        console.log(`✅ Sample value:`, records[0][primaryKey]);
      }
    }

    return primaryKey;
  }, [columns, records]);
}
