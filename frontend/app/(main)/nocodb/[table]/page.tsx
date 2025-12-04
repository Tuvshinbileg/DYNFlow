import { notFound } from "next/navigation";
import Link from "next/link";
import { nocodbService } from "@/lib/nocodb";
import { NocoDBTableView } from "@/components/nocodb-table-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ table: string }>;
  searchParams: Promise<{ page?: string; offset?: string }>;
}

export default async function NocoDBTablePage({ params, searchParams }: PageProps) {
  const { table: tableName } = await params;
  const searchParamsResolved = await searchParams;
  const page = Number(searchParamsResolved.page) || 1;
  const pageSize = 10;
  const offset = Number(searchParamsResolved.offset) || (page - 1) * pageSize;

  let tableMetadata = null;
  let records: Array<Record<string, unknown>> = [];
  let totalRows = 0;
  let baseId = "";
  let error: string | null = null;

  try {
    // Get the first base
    const bases = await nocodbService.getBases();
    if (bases.length === 0 || !bases[0].id) {
      error = "No NocoDB bases found";
    } else {
      baseId = bases[0].id;

      // Get all tables to find the current one
      const tables = await nocodbService.getTables(baseId);
      const currentTable = tables.find(
        (t) => t.table_name === tableName || t.title === tableName
      );

      if (!currentTable || !currentTable.id) {
        return notFound();
      }

      // Get table metadata (including columns)
      tableMetadata = await nocodbService.getTableMetadata(currentTable.id);

      if (!tableMetadata) {
        error = "Failed to load table metadata";
      } else {
        // Get records with pagination
        const response = await nocodbService.getRecords(baseId, tableName, {
          limit: pageSize,
          offset: offset,
        });

        records = response.list;
        totalRows = response.pageInfo?.totalRows || records.length;
      }
    }
  } catch (e) {
    error = "Failed to load table data";
    console.error("Error loading NocoDB table:", e);
  }

  if (error) {
    return (
      <div className="bg-linear-to-br">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href="/nocodb">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tables
              </Link>
            </Button>
          </div>
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please check your NocoDB connection and try again.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!tableMetadata || !tableMetadata.columns) {
    return notFound();
  }

  return (
    <div className="bg-linear-to-br">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/nocodb">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tables
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {tableMetadata.title || tableName}
            </h2>
            <p className="text-muted-foreground">
              Table: <code className="bg-slate-100 px-2 py-1 rounded text-sm">
                {tableName}
              </code>
            </p>
          </div>
        </div>

        <NocoDBTableView
          tableName={tableName}
          baseId={baseId}
          initialRecords={records}
          columns={tableMetadata.columns}
          totalRows={totalRows}
          currentPage={page}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}
