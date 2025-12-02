import { notFound } from 'next/navigation';
import Link from 'next/link';
import { contentTypesApi } from '@/lib/api';
import { DynamicForm } from '@/components/dynamic-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CreatePageProps {
  params: {
    contentType: string;
  };
}

export default async function CreatePage({ params }: CreatePageProps) {
  let contentType;

  try {
    contentType = await contentTypesApi.getByIdOrName(params.contentType);
  } catch (error) {
    notFound();
  }

  if (!contentType) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Create {contentType.display_name}
            </h1>
            {contentType.description && (
              <p className="text-muted-foreground">{contentType.description}</p>
            )}
          </div>
        </div>

        {contentType.fields.length === 0 ? (
          <Card className="border-yellow-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-yellow-600" />
                <CardTitle>No Fields Defined</CardTitle>
              </div>
              <CardDescription>
                This content type has no fields. Please add fields in the Django admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a 
                  href={`http://localhost:8000/admin/content_types_app/contenttype/${contentType.id}/change/`}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Edit in Admin
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Fill in the form</CardTitle>
              <CardDescription>
                Fields marked with <span className="text-destructive">*</span> are required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicForm contentType={contentType} />
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Content Type Info
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Name:</strong> <code className="bg-white px-2 py-1 rounded">{contentType.name}</code>
            </p>
            <p>
              <strong>Fields:</strong> {contentType.fields.length}
            </p>
            <p>
              <strong>Active:</strong> {contentType.is_active ? '✅ Yes' : '❌ No'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
