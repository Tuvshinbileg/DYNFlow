# DateTime Picker Implementation

## Overview
The NocoDB form now uses **shadcn UI components** for Date and DateTime fields instead of native HTML5 inputs.

## Components Created

### 1. DateTimePicker (`/components/ui/datetime-picker.tsx`)

A custom shadcn component that combines:
- **Calendar** for date selection
- **Time input** for time selection
- **Popover** for elegant dropdown UI

#### Features:
- ✅ Calendar picker with shadcn styling
- ✅ Time selector with clock icon
- ✅ "Done" button to close
- ✅ ISO datetime format output
- ✅ Proper date formatting (e.g., "Dec 4, 2024 at 14:30")
- ✅ Disabled state support

#### Props:
```typescript
interface DateTimePickerProps {
  value?: string;          // ISO datetime string
  onChange: (datetime: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

#### Example Usage:
```tsx
<DateTimePicker
  value="2024-12-04T14:30:00.000Z"
  onChange={(datetime) => console.log(datetime)}
  placeholder="Select date and time"
/>
```

### 2. DatePicker (existing)

The existing shadcn DatePicker is now used for Date fields:
- Calendar picker only
- Returns `yyyy-MM-dd` format

## Implementation in NocoDB Forms

### Date Field
```tsx
case 'Date':
  return (
    <DatePicker
      value={value}
      onChange={onChange}
      placeholder={`Select ${title}`}
    />
  );
```

**Before**:
```tsx
<Input type="date" value={value} onChange={...} />
```

**After**:
```tsx
<DatePicker value={value} onChange={onChange} />
```

### DateTime Field
```tsx
case 'DateTime':
  return (
    <DateTimePicker
      value={value}
      onChange={onChange}
      placeholder={`Select ${title}`}
    />
  );
```

**Before**:
```tsx
<Input type="datetime-local" value={value} onChange={...} />
```

**After**:
```tsx
<DateTimePicker value={value} onChange={onChange} />
```

## Visual Comparison

### Before (Native Input)
```
┌─────────────────────────────────────┐
│ Start Date                          │
├─────────────────────────────────────┤
│ ┌─────────────────┬───────────────┐ │
│ │ 2024-12-04      │ 📅           │ │
│ └─────────────────┴───────────────┘ │
└─────────────────────────────────────┘
```

### After (Shadcn Component)
```
┌─────────────────────────────────────┐
│ Start Date                          │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📅 Dec 4, 2024                  │ │ ← Button
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Clicking opens:
┌───────────────────────────┐
│     December 2024         │
│ Su Mo Tu We Th Fr Sa      │
│  1  2  3  4  5  6  7      │
│  8  9 10 11 12 13 14      │
│ 15 16 17 18 19 20 21      │
│ 22 23 24 25 26 27 28      │
│ 29 30 31                  │
└───────────────────────────┘
```

### DateTime Picker
```
┌─────────────────────────────────────┐
│ Meeting Time                        │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📅 Dec 4, 2024 at 14:30         │ │ ← Button
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Clicking opens:
┌───────────────────────────┐
│     December 2024         │
│ Su Mo Tu We Th Fr Sa      │
│  1  2  3  4  5  6  7      │
│  8  9 10 11 12 13 14      │
│ 15 16 17 18 19 20 21      │
│ 22 23 24 25 26 27 28      │
│ 29 30 31                  │
├───────────────────────────┤
│ Time                      │
│ 🕐 [14:30]               │
│ [     Done     ]          │
└───────────────────────────┘
```

## Benefits

### User Experience
1. **Better Visual Feedback**: Calendar dropdown is more intuitive than typing dates
2. **Consistent UI**: Matches shadcn design system
3. **Error Prevention**: Users can't enter invalid dates
4. **Mobile Friendly**: Calendar works better on touch devices
5. **Accessibility**: Proper keyboard navigation and screen reader support

### Developer Experience
1. **Consistent API**: Same props pattern as other shadcn components
2. **Type Safe**: TypeScript support built-in
3. **Customizable**: Can easily modify styles
4. **Tested**: Built on proven shadcn components

## Dependencies

The DateTimePicker component uses:
- `date-fns` - For date formatting and manipulation
- `@radix-ui/react-popover` - For dropdown behavior
- `lucide-react` - For icons (Calendar, Clock)
- shadcn components:
  - `Button`
  - `Calendar`
  - `Popover`
  - `Input`
  - `Label`

## Date Format Handling

### Input Formats Supported
- ISO 8601: `2024-12-04T14:30:00.000Z`
- Date only: `2024-12-04`
- DateTime local: `2024-12-04T14:30`

### Output Format
- DatePicker: `yyyy-MM-dd` (e.g., `2024-12-04`)
- DateTimePicker: ISO 8601 (e.g., `2024-12-04T14:30:00.000Z`)

### Display Format
- Date: `PPP` format (e.g., `December 4, 2024`)
- DateTime: `PPP at HH:mm` (e.g., `December 4, 2024 at 14:30`)

## Testing

To test the DateTime picker:

1. **Create a table with DateTime column in NocoDB**
2. **Navigate to the table**: `/nocodb/[table-name]`
3. **Click "Add Record" or "Edit"**
4. **Click the DateTime field**:
   - Should open a calendar popover
   - Calendar should show current month
   - Time input should show at bottom
5. **Select a date**: Click any day
6. **Adjust time**: Use time input or type directly
7. **Click "Done"**: Should close popover and show selected date/time
8. **Save the record**: Datetime should persist correctly

## Customization

### Styling
The DateTimePicker uses Tailwind classes and can be customized:

```tsx
<DateTimePicker
  value={value}
  onChange={onChange}
  placeholder="Pick a time"
/>
```

### Modifying the Component
The component is located at `/components/ui/datetime-picker.tsx` and can be modified:

```tsx
// Change time format
<Input
  type="time"
  value={timeValue}
  onChange={handleTimeChange}
  step="900" // 15-minute intervals
/>

// Change date format display
{date && format(date, "MMM d, yyyy 'at' h:mm a")}
// Output: "Dec 4, 2024 at 2:30 PM"
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari
- ✅ Mobile Chrome

The time input uses native `<input type="time">` which is well-supported across modern browsers.

## Migration Notes

### No Breaking Changes
- Existing datetime values work automatically
- ISO format is preserved
- Database schema unchanged

### Gradual Rollout
The change applies to:
- ✅ NocoDB Add Record dialog
- ✅ NocoDB Edit Record dialog
- ℹ️ Other date fields in the app still use existing components

## Future Enhancements

Possible improvements:
- **Date Range Picker**: Select start and end dates
- **Time Zone Support**: Show/convert time zones
- **Quick Presets**: "Today", "Tomorrow", "Next Week"
- **Recurring Dates**: Support for recurring events
- **Custom Time Steps**: 15min, 30min, 1hour intervals
- **12/24 Hour Format**: Toggle based on user preference

## Troubleshooting

### Issue: Calendar doesn't open
**Solution**: Check that Popover component is properly installed
```bash
npx shadcn-ui@latest add popover
```

### Issue: Time doesn't update
**Solution**: Verify `date-fns` is installed
```bash
npm install date-fns
```

### Issue: Wrong date format
**Solution**: Check the value prop is ISO format or valid date string

### Issue: Styling looks broken
**Solution**: Ensure Tailwind CSS is properly configured and all shadcn components are installed
