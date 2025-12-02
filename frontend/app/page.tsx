import Link from 'next/link';
import { contentTypesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  let contentTypes = [];
  let error = null;

  try {
    contentTypes = await contentTypesApi.getAll();
  } catch (e) {
    error = 'Failed to load content types. Make sure the Django backend is running.';
    console.error('Error fetching content types:', e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-12 px-4">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🚀 Dynamic Form System
          </h1>
          <p className="text-xl text-muted-foreground">
            Strapi-style Content Management with Next.js 14 & Django
          </p>
        </div>

        {error ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please ensure:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                <li>Django backend is running on <code className="bg-slate-200 px-1 rounded">http://localhost:8000</code></li>
                <li>MongoDB is connected</li>
                <li>CORS is configured properly</li>
                <li>Content types are created in Django admin</li>
              </ul>
            </CardContent>
          </Card>
        ) : contentTypes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Content Types Yet</CardTitle>
              <CardDescription>
                Create your first content type in the Django admin panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Visit <code className="bg-slate-200 px-2 py-1 rounded">http://localhost:8000/admin/</code> to create content types.
              </p>
              <Button asChild>
                <a href="http://localhost:8000/admin/" target="_blank" rel="noopener noreferrer">
                  Open Django Admin
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentTypes.map((contentType) => (
              <Card key={contentType.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-xl">{contentType.display_name}</CardTitle>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {contentType.field_count} fields
                    </span>
                  </div>
                  <CardDescription className="mt-2">
                    {contentType.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/create/${contentType.name}`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/view/${contentType.name}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        View All
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <code className="bg-slate-100 px-2 py-1 rounded">
                      {contentType.name}
                    </code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Card className="inline-block">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Manage content types and view API documentation
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild variant="outline">
                  <a href="http://localhost:8000/admin/" target="_blank" rel="noopener noreferrer">
                    Django Admin
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href="http://localhost:8000/api/content-types/" target="_blank" rel="noopener noreferrer">
                    API Docs
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
