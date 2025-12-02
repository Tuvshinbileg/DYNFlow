import { notFound } from 'next/navigation';
import Link from 'next/link';
import { contentTypesApi, contentApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Database } from 'lucide-react';
import { DeleteButton } from '@/components/delete-button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ViewPageProps {
  params: {
    contentType: string;
  };
}

export default async function ViewPage({ params }: ViewPageProps) {
  let contentType;
  let contentData;

  try {
    contentType = await contentTypesApi.getByIdOrName(params.contentType);
    contentData = await contentApi.getAll(params.contentType);
  } catch (error) {
    notFound();
  }

  if (!contentType) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
              <Link href={`/create/${params.contentType}`}>
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
                <Link href={`/create/${params.contentType}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create {contentType.display_name}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {contentData.results.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        Entry ID: <code className="text-sm bg-slate-100 px-2 py-1 rounded">{entry.id}</code>
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Created: {new Date(entry.created_at).toLocaleString()}
                      </CardDescription>
                    </div>
                    <DeleteButton 
                      contentTypeName={params.contentType}
                      contentId={entry.id}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(entry)
                      .filter(([key]) => !['id', 'content_type', 'created_at', 'updated_at'].includes(key))
                      .map(([key, value]) => {
                        const field = contentType.fields.find(f => f.field_name === key);
                        const displayName = field?.display_name || key;
                        
                        return (
                          <div key={key} className="p-3 bg-slate-50 rounded-lg">
                            <div className="text-xs font-semibold text-muted-foreground mb-1">
                              {displayName}
                            </div>
                            <div className="text-sm font-medium break-words">
                              {typeof value === 'boolean' 
                                ? (value ? '✅ Yes' : '❌ No')
                                : value?.toString() || <span className="text-muted-foreground italic">Empty</span>
                              }
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
