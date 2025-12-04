# NocoDB Edit/Delete Troubleshooting

## Current Error
```
Cannot find valid record ID in field "id". Check console for details.
```

## What This Means
The system detected "id" as the primary key field name, but when it tries to read the actual ID value from the record, it's getting `null`, `undefined`, or an empty string.

## How to Debug

### Step 1: Open Browser Console
1. Press `F12` or `Cmd+Option+I` (Mac)
2. Go to the **Console** tab
3. Navigate to your NocoDB table page
4. Look for the logs when the page loads

### Step 2: Check the Logs

Look for these specific log entries:

#### A. Record Structure
```
📦 Sample record structure: { ... }
📦 All record keys: [ ... ]
```
**What to check**: See what fields are actually in your records

#### B. Primary Key Detection
```
🔍 Primary key from column metadata: [value]
```
**What to check**: Is this empty, or does it show a field name?

#### C. Field Values
```
✅ Final primary key: "id"
✅ Sample value: [value]
```
**What to check**: What is the sample value? Is it a number, null, undefined, or empty?

### Step 3: Try to Edit/Delete

Click the Edit or Delete button and check the console for:

```
✏️ Attempting to update record
📋 Full record: { ... all fields ... }
🔑 Primary key field: id
🆔 Raw ID value: [value] (type: [type])
```

**Key Questions**:
1. What is the "Raw ID value"? Is it null, undefined, or an actual value?
2. What "type" is it? (should be number or string)
3. Look at the "Full record" - is there a field that DOES have an ID value?

## Common Solutions

### Solution 1: Field Name Mismatch
If the console shows a different field has the ID:

```
📋 Full record: { "Id": 123, "id": null, "name": "Test" }
```

The primary key should be "Id" (capital I), not "id" (lowercase).

**The new code should automatically detect this**, but if it doesn't:
1. Note which field has the actual ID value
2. Check if it contains 'id' in the name - the system will try that field

### Solution 2: NocoDB API Issue
If ALL fields show null/undefined IDs, the issue is with how NocoDB is returning data.

**Check**:
1. Open NocoDB directly (`http://localhost:8080`)
2. View the table
3. Verify records have IDs
4. Check if the NocoDB API token is correct

### Solution 3: Case Sensitivity
NocoDB commonly uses these field names (in this order):
- `Id` (most common - capital I)
- `ID` (all caps)
- `id` (lowercase)
- `_id` (with underscore)

**The system now checks all of these automatically.**

### Solution 4: Check Network Request
1. Open DevTools Network tab
2. Try to edit a record
3. Look for the failed API request
4. Check what ID was sent in the URL
5. Compare with what's in your record

## Advanced Debugging

### Check Record Data Type
If the console shows:
```
🆔 Raw ID value: undefined (type: undefined)
```

This means the field `id` doesn't exist in the record at all.

**Look at**:
```
📋 Full record: { ... }
```
And find which field actually has a unique number or string value.

### Enable More Logging
The component now logs:
- 📦 Sample record structure on page load
- 📋 Full record data when clicking edit/delete
- 🔑 Primary key field name
- 🆔 Raw ID value and its type
- ✅ or ❌ Success/failure messages

### Check Alternative ID Detection
If the primary key field is null, the system now tries:
```javascript
selectedRecord['Id'] || selectedRecord['ID'] || selectedRecord['_id'] || selectedRecord['ncRecordId']
```

If you see:
```
⚠️ Primary key field value is null/undefined, trying alternatives...
✅ Found alternative ID: [value]
```

That means it found a working ID field.

## What to Share If Still Broken

If it still doesn't work, share these console outputs:

1. **Page Load Logs**:
   ```
   📦 Sample record structure: [paste here]
   📦 All record keys: [paste here]
   ✅ Final primary key: [paste here]
   ```

2. **Edit/Delete Attempt Logs**:
   ```
   📋 Full record: [paste here]
   🔑 Primary key field: [paste here]
   🆔 Raw ID value: [paste here]
   ```

3. **Network Tab**:
   - The failed request URL
   - The request payload
   - The response (if any)

## Expected Working Example

When working correctly, you should see:

```
📦 Sample record structure: { Id: 123, Name: "Test", ... }
📦 All record keys: [ 'Id', 'Name', 'Description', ... ]
🔍 Primary key from column metadata: Id
✅ Final primary key: "Id"
✅ Sample value: 123

[Click Edit]

✏️ Edit button clicked
📋 Record data: { Id: 123, Name: "Test", ... }
🔑 Primary key field: Id
🆔 Record ID value: 123

[Click Save]

🔄 Attempting to update record
📋 Full record: { Id: 123, ... }
🔑 Primary key field: Id
🆔 Raw ID value: 123 (type: number)
✅ Using record ID: "123"
Toast: "Record updated successfully"
```

## Quick Fixes to Try

1. **Refresh the page** - Sometimes the initial load fails
2. **Check NocoDB is running** - Visit `http://localhost:8080`
3. **Verify API token** - Check your `.env.local` file
4. **Check table has primary key** - In NocoDB, verify your table has an ID column
5. **Try a different record** - Maybe one record is corrupted
6. **Clear cache and hard reload** - Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
