import { notFound } from 'next/navigation';
import Link from 'next/link';
import { contentTypesApi, contentApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Database } from 'lucide-react';
import { DynamicContentTable } from '@/components/dynamic-content-table';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ViewPageProps {
  params: Promise<{
    contentType: string;
  }>;
}

export default async function ViewPage({ params }: ViewPageProps) {
  const resolvedParams = await params;
  let contentType;
  let contentData;

  try {
    contentType = await contentTypesApi.getByIdOrName(resolvedParams.contentType);
    contentData = await contentApi.getAll(resolvedParams.contentType);
  } catch {
    notFound();
  }

  if (!contentType) {
    notFound();
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {contentType.display_name}
              </h1>
              <p className="text-muted-foreground">
                {contentData.count} {contentData.count === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            <Button asChild>
              <Link href={`/create/${resolvedParams.contentType}`}>
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Link>
            </Button>
          </div>
        </div>

        {contentData.results.length === 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                <CardTitle>No Content Yet</CardTitle>
              </div>
              <CardDescription>
                Create your first {contentType.display_name.toLowerCase()} entry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/create/${resolvedParams.contentType}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create {contentType.display_name}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <DynamicContentTable
                contentType={contentType}
                data={contentData.results}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
