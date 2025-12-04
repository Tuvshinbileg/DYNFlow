# Quick Start: Using Refactored Components

## 🚀 Getting Started

### Step 1: Replace the Old Component

**In your page/component**:
```tsx
// OLD
import { NocoDBTableView } from "@/components/nocodb-table-view";

// NEW
import { NocoDBTableView } from "@/components/nocodb-table-view-refactored";
```

**No other changes needed!** The component API is identical.

## 📦 What You Get

### 10 New Files Created

```
frontend/
├── components/
│   └── nocodb/                    ← NEW folder
│       ├── index.ts               ← Easy imports
│       ├── table-toolbar.tsx      ← Add/Refresh buttons
│       ├── data-table.tsx         ← Main table display
│       ├── table-pagination.tsx   ← Page controls
│       ├── field-renderer.tsx     ← Dynamic input fields
│       ├── record-form-dialog.tsx ← Add/Edit dialog
│       └── delete-confirmation-dialog.tsx
├── hooks/                         ← NEW folder
│   ├── index.ts                   ← Easy imports
│   ├── use-primary-key.ts         ← PK detection logic
│   └── use-record-operations.ts  ← CRUD operations
└── nocodb-table-view-refactored.tsx ← NEW main component
```

## 🎯 Using Individual Components

### Example 1: Use FieldRenderer Elsewhere

```tsx
import { FieldRenderer } from '@/components/nocodb';

function MyCustomForm() {
  const [value, setValue] = useState('');
  
  return (
    <FieldRenderer
      column={{
        uidt: 'LongText',
        title: 'Description',
        column_name: 'description',
      }}
      value={value}
      onChange={setValue}
    />
  );
}
```

### Example 2: Use Custom Hooks

```tsx
import { usePrimaryKey, useRecordOperations } from '@/hooks';

function MyDataComponent({ columns, records, baseId, tableName }) {
  // Detect primary key
  const primaryKey = usePrimaryKey(columns, records);
  
  // Get CRUD operations
  const { isLoading, createRecord, updateRecord, deleteRecord } = 
    useRecordOperations(baseId, tableName, primaryKey);
  
  const handleCreate = async () => {
    const newRecord = await createRecord({ name: 'Test' });
    if (newRecord) {
      console.log('Created:', newRecord);
    }
  };
  
  return <button onClick={handleCreate}>Create</button>;
}
```

### Example 3: Reuse Form Dialog

```tsx
import { RecordFormDialog } from '@/components/nocodb';

function MyPage() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  
  return (
    <RecordFormDialog
      open={open}
      onOpenChange={setOpen}
      title="Custom Form"
      description="Fill in the details"
      columns={myColumns}
      formData={formData}
      onFormDataChange={setFormData}
      onSubmit={handleSubmit}
      isLoading={false}
    />
  );
}
```

## 🔧 Customization Guide

### Change Toolbar Buttons

**File**: `components/nocodb/table-toolbar.tsx`

```tsx
export function TableToolbar({ onAdd, onRefresh, totalRows }: TableToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
        <Button onClick={onRefresh} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        {/* ADD YOUR CUSTOM BUTTONS HERE */}
        <Button onClick={onExport} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {totalRows} total rows
        </span>
      </div>
    </div>
  );
}
```

### Add Custom Field Type

**File**: `components/nocodb/field-renderer.tsx`

```tsx
export function FieldRenderer({ column, value, onChange }: FieldRendererProps) {
  const { uidt, title, column_name } = column;
  
  switch (uidt) {
    // ... existing cases
    
    case 'MyCustomType':
      return (
        <MyCustomInput
          value={value}
          onChange={onChange}
          placeholder={`Enter ${title}`}
        />
      );
    
    default:
      return <Input type="text" value={value} onChange={...} />;
  }
}
```

### Modify Table Appearance

**File**: `components/nocodb/data-table.tsx`

```tsx
export function DataTable({ columns, records, onEdit, onDelete }: DataTableProps) {
  return (
    <div className="rounded-md border">
      <Table className="hover:shadow-md transition-shadow"> {/* Custom styling */}
        <TableHeader className="bg-gray-50"> {/* Custom header */}
          {/* ... */}
        </TableHeader>
        <TableBody>
          {/* ... */}
        </TableBody>
      </Table>
    </div>
  );
}
```

## 📚 Component API Reference

### TableToolbar

```typescript
interface TableToolbarProps {
  onAdd: () => void;          // Called when Add button clicked
  onRefresh: () => void;      // Called when Refresh clicked
  totalRows: number;          // Total number of rows to display
}
```

### DataTable

```typescript
interface DataTableProps {
  columns: NocoDBColumn[];                           // Columns to display
  records: NocoDBRecord[];                           // Records to display
  onEdit: (record: NocoDBRecord, index: number) => void;   // Edit handler
  onDelete: (record: NocoDBRecord, index: number) => void; // Delete handler
}
```

### FieldRenderer

```typescript
interface FieldRendererProps {
  column: NocoDBColumn;       // Column metadata
  value: string;              // Current value
  onChange: (value: string) => void; // Change handler
}
```

### RecordFormDialog

```typescript
interface RecordFormDialogProps {
  open: boolean;                                    // Dialog open state
  onOpenChange: (open: boolean) => void;           // Open state handler
  title: string;                                   // Dialog title
  description: string;                             // Dialog description
  columns: NocoDBColumn[];                         // Form columns
  formData: Record<string, string>;                // Form data
  onFormDataChange: (data: Record<string, string>) => void; // Data handler
  onSubmit: () => void;                            // Submit handler
  isLoading: boolean;                              // Loading state
  submitLabel?: string;                            // Submit button text
}
```

## 🧪 Testing

### Test Individual Component

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TableToolbar } from '@/components/nocodb';

describe('TableToolbar', () => {
  it('calls onAdd when Add button is clicked', () => {
    const onAdd = jest.fn();
    render(<TableToolbar onAdd={onAdd} onRefresh={jest.fn()} totalRows={10} />);
    
    fireEvent.click(screen.getByText('Add Record'));
    expect(onAdd).toHaveBeenCalled();
  });
});
```

### Test Custom Hook

```tsx
import { renderHook } from '@testing-library/react-hooks';
import { usePrimaryKey } from '@/hooks';

describe('usePrimaryKey', () => {
  it('detects primary key from columns', () => {
    const columns = [
      { id: '1', column_name: 'id', pk: true },
      { id: '2', column_name: 'name', pk: false },
    ];
    const records = [];
    
    const { result } = renderHook(() => usePrimaryKey(columns, records));
    expect(result.current).toBe('id');
  });
});
```

## 🚨 Common Issues

### Issue 1: Can't find component

**Error**: `Module not found: Can't resolve '@/components/nocodb'`

**Solution**: Make sure you created the index.ts file:
```tsx
// components/nocodb/index.ts
export { TableToolbar } from './table-toolbar';
export { DataTable } from './data-table';
// ... etc
```

### Issue 2: TypeScript errors

**Error**: `Cannot find module '@/hooks'`

**Solution**: Create hooks/index.ts or import directly:
```tsx
import { usePrimaryKey } from '@/hooks/use-primary-key';
```

### Issue 3: Component not updating

**Solution**: Check that you're using state management correctly:
```tsx
const [records, setRecords] = useState(initialRecords);
// Not: const records = initialRecords;
```

## 📖 Further Reading

- **COMPONENT_REFACTORING.md** - Detailed refactoring guide
- **REFACTORING_SUMMARY.md** - Quick comparison and benefits
- Component source code - Each file has inline comments

## ✅ Checklist

Before deploying:
- [ ] All components imported correctly
- [ ] No TypeScript errors
- [ ] Tested Add operation
- [ ] Tested Edit operation
- [ ] Tested Delete operation
- [ ] Tested all field types
- [ ] Tested pagination
- [ ] Checked console for errors
- [ ] Verified loading states work
- [ ] Compared with old component

## 🎉 You're Done!

The refactored component is ready to use. It provides the same functionality as before, but with much better maintainability and reusability.

**Questions?** Check the documentation files or the inline code comments.
