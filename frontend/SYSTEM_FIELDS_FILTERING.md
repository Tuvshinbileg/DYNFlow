# System Fields Filtering

## What Was Changed

Updated `/components/nocodb-table-view.tsx` to automatically hide system fields from the NocoDB table views.

## Hidden Fields

The following system fields are now automatically filtered out:

### By System Property
- Any column where `system: true` in NocoDB metadata

### By Field Name (case-insensitive)
- `created_at` / `createdAt` / `nc_created_at`
- `updated_at` / `updatedAt` / `nc_updated_at`
- `created_by` / `createdBy` / `nc_created_by`
- `updated_by` / `updatedBy` / `nc_updated_by`

## Where It Applies

System fields are hidden in:
1. ✅ **Table Header** - Column headers
2. ✅ **Table Body** - Data cells
3. ✅ **Add Record Form** - Creation dialog
4. ✅ **Edit Record Form** - Update dialog

## Implementation

```typescript
// Filter logic
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

const visibleColumns = columns.filter((col) => !isSystemField(col));
```

## Customization

To add more fields to hide, edit the `systemFieldNames` array in `/components/nocodb-table-view.tsx`:

```typescript
const systemFieldNames = [
  // Existing fields...
  'your_custom_field_name',  // Add your field name here
];
```

## Result

- ✅ Cleaner table display
- ✅ No system fields cluttering the UI
- ✅ Focus on user-editable data
- ✅ System fields are still in the database, just hidden from view
