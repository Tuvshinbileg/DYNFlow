"use client"

import type { ContentTypeResponse } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeleteButton } from '@/components/delete-button';
import { EditButton } from '@/components/edit-button';
import { Badge } from '@/components/ui/badge';

interface DynamicContentTableProps {
  contentType: ContentTypeResponse;
  data: Array<Record<string, unknown>>;
}

export function DynamicContentTable({ contentType, data }: DynamicContentTableProps) {
  // Get visible fields (exclude system fields)
  const visibleFields = contentType.fields.filter(
    field => !['id', 'content_type', 'created_at', 'updated_at'].includes(field.field_name)
  );

  const formatCellValue = (value: unknown, fieldType: string): React.ReactNode => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground italic">Empty</span>;
    }

    switch (fieldType) {
      case 'boolean':
        return (
          <Badge variant={Boolean(value) ? 'default' : 'secondary'}>
            {Boolean(value) ? '✅ Yes' : '❌ No'}
          </Badge>
        );
      case 'date':
        return new Date(value as string | number).toLocaleDateString();
      case 'number':
        return <span className="font-mono">{String(value)}</span>;
      case 'email':
        return <a href={`mailto:${String(value)}`} className="text-blue-600 hover:underline">{String(value)}</a>;
      case 'select':
        return <Badge variant="outline">{String(value)}</Badge>;
      default:
        // Truncate long text
        const stringValue = String(value);
        return stringValue.length > 50
          ? <span title={stringValue}>{stringValue.substring(0, 50)}...</span>
          : stringValue;
    }
  };

  return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            {visibleFields.map((field) => (
              <TableHead key={field.field_name}>
                {field.display_name}
              </TableHead>
            ))}
            <TableHead className="w-[150px]">Created</TableHead>
            <TableHead className="w-[200px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={visibleFields.length + 3}
                className="h-24 text-center text-muted-foreground"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((entry) => (
              <TableRow key={String(entry.id)}>
                <TableCell className="font-mono text-xs">
                  {String(entry.id).substring(0, 8)}...
                </TableCell>
                {visibleFields.map((field) => (
                  <TableCell key={field.field_name}>
                    {formatCellValue(entry[field.field_name], field.field_type)}
                  </TableCell>
                ))}
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(entry.created_at as string | number).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <EditButton
                      contentType={contentType}
                      contentData={entry}
                    />
                    <DeleteButton
                      contentTypeName={String(entry.content_type)}
                      contentId={String(entry.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
  );
}
