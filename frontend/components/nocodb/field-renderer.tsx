"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import type { NocoDBColumn } from "@/lib/nocodb";

interface FieldRendererProps {
  column: NocoDBColumn;
  value: string;
  onChange: (value: string) => void;
}

export function FieldRenderer({ column, value, onChange }: FieldRendererProps) {
  const { uidt, title, column_name } = column;
  const commonProps = {
    id: `field-${column_name}`,
    placeholder: `Enter ${title}`,
  };

  // Map NocoDB UI Data Types to appropriate input components
  switch (uidt) {
    case 'LongText':
    case 'MultiLineText':
      return (
        <Textarea
          {...commonProps}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="resize-y"
        />
      );

    case 'Checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={commonProps.id}
            checked={value === 'true' || value === '1' || Boolean(value)}
            onCheckedChange={(checked) => onChange(String(checked))}
          />
          <Label htmlFor={commonProps.id} className="cursor-pointer font-normal">
            {title}
          </Label>
        </div>
      );

    case 'Date':
      return (
        <DatePicker
          value={value}
          onChange={onChange}
          placeholder={`Select ${title}`}
        />
      );

    case 'DateTime':
      return (
        <DateTimePicker
          value={value}
          onChange={onChange}
          placeholder={`Select ${title}`}
        />
      );

    case 'Time':
      return (
        <Input
          {...commonProps}
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'Number':
    case 'Decimal':
    case 'Currency':
    case 'Percent':
      return (
        <Input
          {...commonProps}
          type="number"
          step={uidt === 'Decimal' || uidt === 'Currency' || uidt === 'Percent' ? '0.01' : '1'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'Email':
      return (
        <Input
          {...commonProps}
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'URL':
      return (
        <Input
          {...commonProps}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'PhoneNumber':
      return (
        <Input
          {...commonProps}
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'SingleSelect':
      return (
        <Input
          {...commonProps}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Select ${title}`}
        />
      );

    case 'Rating':
      return (
        <Input
          {...commonProps}
          type="number"
          min="0"
          max="5"
          step="1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'Duration':
      return (
        <Input
          {...commonProps}
          type="number"
          placeholder="Duration in seconds"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'SingleLineText':
    case 'Text':
    default:
      return (
        <Input
          {...commonProps}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
