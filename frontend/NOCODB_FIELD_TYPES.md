# NocoDB Dynamic Field Rendering

## Overview
The NocoDB table view now automatically renders the correct input type based on each column's data type (`uidt` - UI Data Type).

## Supported Field Types

### Text Fields

#### `SingleLineText` / `Text`
- **Renders**: Text input
- **Example**: Name, Title, Short description
- **HTML**: `<input type="text" />`

#### `LongText` / `MultiLineText`
- **Renders**: Textarea (resizable, 4 rows)
- **Example**: Description, Notes, Comments
- **HTML**: `<textarea rows="4" />`

### Date & Time Fields

#### `Date`
- **Renders**: Date picker
- **Example**: Birth date, Deadline
- **HTML**: `<input type="date" />`
- **Format**: YYYY-MM-DD

#### `DateTime`
- **Renders**: Date and time picker
- **Example**: Created at, Meeting time
- **HTML**: `<input type="datetime-local" />`
- **Format**: YYYY-MM-DDThh:mm

#### `Time`
- **Renders**: Time picker
- **Example**: Start time, Duration
- **HTML**: `<input type="time" />`
- **Format**: HH:mm

### Number Fields

#### `Number`
- **Renders**: Number input (integers)
- **Example**: Quantity, Count, Age
- **HTML**: `<input type="number" step="1" />`

#### `Decimal` / `Currency` / `Percent`
- **Renders**: Number input (decimals)
- **Example**: Price, Amount, Percentage
- **HTML**: `<input type="number" step="0.01" />`

#### `Rating`
- **Renders**: Number input (0-5)
- **Example**: Star rating, Score
- **HTML**: `<input type="number" min="0" max="5" />`

#### `Duration`
- **Renders**: Number input (seconds)
- **Example**: Video length, Time spent
- **HTML**: `<input type="number" placeholder="Duration in seconds" />`

### Boolean Field

#### `Checkbox`
- **Renders**: Checkbox with inline label
- **Example**: Is active, Completed, Verified
- **HTML**: `<Checkbox />` with `<Label />`
- **Values**: `'true'`, `'1'`, or truthy values

### Contact Fields

#### `Email`
- **Renders**: Email input
- **Example**: Contact email, User email
- **HTML**: `<input type="email" />`
- **Validation**: Email format

#### `PhoneNumber`
- **Renders**: Phone input
- **Example**: Contact number, Mobile
- **HTML**: `<input type="tel" />`

#### `URL`
- **Renders**: URL input
- **Example**: Website, Profile link
- **HTML**: `<input type="url" />`
- **Validation**: URL format

### Select Fields

#### `SingleSelect`
- **Renders**: Text input (basic)
- **Example**: Status, Category, Priority
- **Note**: Can be enhanced with actual dropdown options
- **TODO**: Implement dropdown with options from `dtxp` or `colOptions`

## Field Type Mapping

The field rendering is handled by the `renderFieldInput()` function in `nocodb-table-view.tsx`:

```typescript
const renderFieldInput = (
  col: NocoDBColumn,
  value: string,
  onChange: (value: string) => void
) => {
  switch (col.uidt) {
    case 'LongText': return <Textarea />
    case 'Checkbox': return <Checkbox />
    case 'Date': return <Input type="date" />
    case 'DateTime': return <Input type="datetime-local" />
    case 'Number': return <Input type="number" />
    case 'Email': return <Input type="email" />
    // ... etc
  }
}
```

## Usage Examples

### Example 1: Blog Post Table
```
Column Name | UI Data Type | Rendered Input
----------- | ------------ | --------------
Title       | SingleLineText | Text input
Content     | LongText      | Textarea (4 rows)
Published   | Checkbox      | Checkbox
Publish Date| Date          | Date picker
Author Email| Email         | Email input
Views       | Number        | Number input
```

### Example 2: Event Table
```
Column Name  | UI Data Type | Rendered Input
------------ | ------------ | --------------
Event Name   | SingleLineText | Text input
Description  | LongText      | Textarea
Start Time   | DateTime      | DateTime picker
End Time     | DateTime      | DateTime picker
Is Public    | Checkbox      | Checkbox
Attendees    | Number        | Number input
Website      | URL           | URL input
```

### Example 3: Product Table
```
Column Name | UI Data Type | Rendered Input
----------- | ------------ | --------------
Name        | SingleLineText | Text input
Description | LongText      | Textarea
Price       | Currency      | Number (0.01 step)
Stock       | Number        | Number input
Rating      | Rating        | Number (0-5)
In Stock    | Checkbox      | Checkbox
```

## Visual Examples

### Long Text Field
```
┌─────────────────────────────────────┐
│ Description                         │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Enter description...            │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Date Field
```
┌─────────────────────────────────────┐
│ Start Date                          │
├─────────────────────────────────────┤
│ ┌─────────────────┬───────────────┐ │
│ │ 2024-12-04      │ 📅           │ │
│ └─────────────────┴───────────────┘ │
└─────────────────────────────────────┘
```

### Checkbox Field
```
┌─────────────────────────────────────┐
│ ☑ Is Active                         │
└─────────────────────────────────────┘
```

### Number Field
```
┌─────────────────────────────────────┐
│ Quantity                            │
├─────────────────────────────────────┤
│ ┌─────────────────┬───────────────┐ │
│ │ 10              │ ▲▼           │ │
│ └─────────────────┴───────────────┘ │
└─────────────────────────────────────┘
```

## Special Handling

### Checkbox Labels
Checkbox fields render their label inline (to the right of the checkbox) instead of above:
```tsx
<div className="flex items-center space-x-2">
  <Checkbox />
  <Label>Field Name</Label>
</div>
```

### Date Formatting
Date and DateTime fields handle ISO format strings:
- **Date**: Extracts `YYYY-MM-DD` from `YYYY-MM-DDThh:mm:ss.sssZ`
- **DateTime**: Truncates to `YYYY-MM-DDThh:mm` for datetime-local input

### Value Conversion
All values are stored as strings in the form state but converted appropriately:
- Numbers: Parsed as needed
- Booleans: Checked against `'true'`, `'1'`, or truthy values
- Dates: Formatted for HTML5 date/datetime inputs

## Future Enhancements

### SingleSelect / MultiSelect
Currently renders as text input. Can be enhanced to:
```tsx
case 'SingleSelect':
  const options = JSON.parse(col.dtxp || '[]');
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
```

### Rich Text
For `LongText` fields with rich text:
```tsx
case 'LongText':
  if (col.meta?.richText) {
    return <RichTextEditor value={value} onChange={onChange} />
  }
  return <Textarea />
```

### File Attachments
```tsx
case 'Attachment':
  return <FileUpload value={value} onChange={onChange} />
```

### Link to Another Record
```tsx
case 'LinkToAnotherRecord':
  return <RecordLinkSelector linkedTable={col.meta?.linked_table} />
```

## Testing Field Types

To test the field rendering:

1. **Create different column types in NocoDB**:
   - Add a Long Text column
   - Add a Date column
   - Add a Checkbox column
   - Add a Number column

2. **Open the table in the app**:
   - Navigate to `/nocodb/[your-table]`
   - Click "Add Record" or "Edit" on existing record

3. **Verify correct inputs render**:
   - Long text shows textarea
   - Date shows date picker
   - Checkbox shows checkbox
   - Numbers show number input

4. **Test data persistence**:
   - Fill in the form
   - Save the record
   - Edit again to verify values are correct

## Debugging

If a field doesn't render correctly:

1. **Check console for column info**:
   ```
   📋 All columns: [{ name: "...", uidt: "...", ... }]
   ```

2. **Verify the `uidt` value** matches expected types

3. **Check if column is being filtered out** (pk, ai, system)

4. **Inspect the rendered component** in browser DevTools

## Column Metadata Structure

Each NocoDB column contains:
```typescript
{
  id: string;
  title: string;          // Display name
  column_name: string;    // Database column
  uidt: string;          // UI Data Type (used for rendering)
  dt: string;            // Database type
  pk: boolean;           // Is primary key
  ai: boolean;           // Is auto-increment
  rqd: boolean;          // Is required
}
```

The `uidt` field is the key that determines which input component to render.
