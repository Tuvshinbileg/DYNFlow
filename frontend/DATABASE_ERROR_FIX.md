# Fix for Database Error on Update

## Error Message
```json
{
  "error": "DATABASE_ERROR",
  "message": "Invalid data type or value for column 'id'.",
  "code": "22P02"
}
```

## Root Cause
The update request was including the primary key field (`id`) in the payload. NocoDB/PostgreSQL doesn't allow updating primary key columns, which caused the error.

**Error Code**: `22P02` = Invalid text representation (PostgreSQL error)

## Solution Applied

### 1. Exclude Primary Key from Form Data Initialization
**File**: `frontend/components/nocodb-table-view.tsx`  
**Function**: `handleEdit`

```typescript
const editFormData: Record<string, string> = {};
visibleColumns.forEach((col) => {
  const key = col.column_name || "";
  // Skip primary key and auto-increment fields
  if (!col.pk && !col.ai) {
    editFormData[key] = String(record[key] || "");
  }
});
```

### 2. Remove ID Fields from Update Payload
**File**: `frontend/components/nocodb-table-view.tsx`  
**Function**: `handleSubmitEdit`

```typescript
// Remove primary key and ID fields from update payload
const updatePayload = { ...formData };
delete updatePayload[primaryKey];
delete updatePayload['id'];
delete updatePayload['Id'];
delete updatePayload['ID'];
delete updatePayload['_id'];

console.log('📤 Update payload (without ID fields):', updatePayload);

await nocodbService.updateRecord(baseId, tableName, recordId, updatePayload);
```

### 3. Hide Primary Key Fields in Edit Dialog
**File**: `frontend/components/nocodb-table-view.tsx`  
**Edit Dialog**

```typescript
{visibleColumns
  .filter((col) => !col.ai && !col.pk)  // ← Added !col.pk
  .map((col) => (
    <Input ... />
  ))
}
```

**Before**: Primary key field was shown but disabled  
**After**: Primary key field is completely hidden from the form

## Triple Protection

The fix implements **three layers of protection**:

1. ✅ **Form initialization** - Don't include primary key in form data
2. ✅ **Update payload** - Explicitly remove all ID field variations before API call
3. ✅ **UI filtering** - Don't render primary key fields in edit dialog

This ensures the primary key is never accidentally sent in the update request.

## Testing the Fix

### 1. Check Form Data
When you click Edit, check the console:
```
✏️ Edit button clicked
📋 Record data: { Id: 123, Name: "Test", Description: "..." }
```

The form should only have editable fields, NOT the Id.

### 2. Check Update Payload
When you click Update/Save, check the console:
```
📤 Update payload (without ID fields): { Name: "Test Updated", Description: "..." }
```

Notice: **No `Id`, `id`, `ID`, `_id`, or primary key field in the payload**.

### 3. Success Message
If successful, you should see:
```
Toast: "Record updated successfully"
```

## Expected Console Output

**Successful Update**:
```
✏️ Edit button clicked
📋 Record data: { Id: 123, Name: "Test", Description: "Desc" }
🔑 Primary key field: Id
🆔 Record ID value: 123

[User edits Name field]

🔄 Attempting to update record
📋 Full record: { Id: 123, Name: "Test Updated", ... }
🔑 Primary key field: Id
🆔 Raw ID value: 123 (type: number)
✅ Using record ID: "123"
📤 Update payload (without ID fields): { Name: "Test Updated", Description: "Desc" }
```

**Notice**: The payload does NOT include `Id`.

## Common Scenarios

### Scenario 1: Table with `Id` (capital I)
- ✅ `Id` used as record identifier in URL
- ✅ `Id` excluded from update payload
- ✅ Only editable fields sent

### Scenario 2: Table with `id` (lowercase)
- ✅ `id` used as record identifier in URL
- ✅ `id` explicitly deleted from payload
- ✅ Works correctly

### Scenario 3: Table with custom primary key
- ✅ Detected primary key field excluded
- ✅ Common ID variations also removed
- ✅ Safe update

## API Call Example

**Before Fix** (❌ ERROR):
```
PUT /api/v1/db/data/noco/baseId/tableName/123
{
  "Id": 123,           ← This causes the error!
  "Name": "Updated",
  "Description": "..."
}
```

**After Fix** (✅ SUCCESS):
```
PUT /api/v1/db/data/noco/baseId/tableName/123
{
  "Name": "Updated",
  "Description": "..."
}
```

The record ID is in the URL path, not in the payload.

## Files Modified

1. `frontend/components/nocodb-table-view.tsx`
   - Line 181-184: Skip PK/AI in form data initialization
   - Line 265-273: Remove ID fields from update payload
   - Line 507: Filter out PK fields from edit dialog

## Verification Checklist

- [ ] Edit dialog opens without showing ID field
- [ ] Console shows form data without ID field
- [ ] Console shows update payload without ID field
- [ ] Update completes successfully
- [ ] No database error
- [ ] Toast shows "Record updated successfully"

## Troubleshooting

If you still get the error:

1. **Check console logs** - Look for `📤 Update payload`
2. **Verify ID is removed** - The payload should NOT contain any ID field
3. **Check NocoDB version** - Ensure compatibility
4. **Verify API endpoint** - Should be PUT with ID in URL, not body

## Related Error Codes

- `22P02` - Invalid text representation (trying to update with wrong type)
- `23505` - Unique violation (would happen if trying to change PK to existing value)
- `42703` - Column doesn't exist (if wrong field name sent)

This fix specifically addresses `22P02` by preventing primary key from being in the update payload.
