import Link from 'next/link';
import { nocodbService } from '@/lib/nocodb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table as TableIcon, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NocoDBPage() {
  let tables: Array<{ 
    id?: string; 
    title?: string; 
    table_name?: string; 
    type?: string;
    rowCount?: number;
  }> = [];
  let error: string | null = null;
  let baseId: string = "";

  try {
    // Get the first base
    const bases = await nocodbService.getBases();
    if (bases.length > 0 && bases[0].id) {
      baseId = bases[0].id;
      
      // Get all tables
      const fetchedTables = await nocodbService.getTables(baseId);
      
      // Get row counts for each table
      tables = await Promise.all(
        fetchedTables.map(async (table) => {
          if (table.table_name && baseId) {
            const count = await nocodbService.getRecordCount(baseId, table.table_name);
            return { ...table, rowCount: count };
          }
          return { ...table, rowCount: 0 };
        })
      );
    } else {
      error = 'No NocoDB bases found. Please ensure NocoDB is running and configured.';
    }
  } catch (e) {
    error = 'Failed to connect to NocoDB. Make sure it is running and accessible.';
    console.error('Error fetching NocoDB tables:', e);
  }

  return (
    <div className="bg-linear-to-br">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">NocoDB Tables</h2>
          <p className="text-muted-foreground">
            Browse and manage your NocoDB tables
          </p>
        </div>

        {error ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Connection Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Please ensure:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>NocoDB is running (default: <code className="bg-slate-200 px-1 rounded">http://localhost:8080</code>)</li>
                <li>API token is configured in environment variables</li>
                <li>At least one base/project exists in NocoDB</li>
              </ul>
              <Button asChild className="mt-4" variant="outline">
                <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">
                  Open NocoDB <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : tables.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Tables Found</CardTitle>
              <CardDescription>
                Create your first table in NocoDB to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">
                  Open NocoDB <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <Card key={table.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <TableIcon className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-xl">{table.title || table.table_name}</CardTitle>
                    </div>
                    {table.rowCount !== undefined && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {table.rowCount} rows
                      </span>
                    )}
                  </div>
                  <CardDescription className="mt-2">
                    Table: <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                      {table.table_name}
                    </code>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/nocodb/${table.table_name}`}>
                      Open Table
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
