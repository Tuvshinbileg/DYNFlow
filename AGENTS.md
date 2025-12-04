# AGENTS.md - AI Agent Context Guide

> **Purpose**: This document provides comprehensive context for AI agents working with the Dynamic Form System. It describes architecture, data flows, key patterns, and implementation details necessary for effective code generation and maintenance.

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [Frontend Architecture](#frontend-architecture)
- [Key Patterns](#key-patterns)
- [Development Workflow](#development-workflow)
- [Common Tasks](#common-tasks)

---

## Project Overview

### What This System Does
A **Strapi-style dynamic content management system** that allows users to:
1. Define content types with custom fields through Django admin
2. Automatically generate forms on the frontend based on these schemas
3. Store dynamic content in MongoDB
4. Manage content through a modern React/Next.js UI

### Technology Stack

**Backend:**
- Django 5.0.1 + Django REST Framework 3.14.0
- PostgreSQL/SQLite (for content type schemas)
- MongoDB + MongoEngine (for dynamic content storage)
- CORS enabled for cross-origin requests

**Frontend:**
- Next.js 14 (App Router with React Server Components)
- TypeScript
- TailwindCSS
- shadcn/ui components
- Axios for API calls
- Zod for validation

### Key Differentiator
**Dual-database architecture**: Content type schemas are stored in PostgreSQL (admin-managed), while actual content instances are stored in MongoDB (flexible, schema-less storage).

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Home Page   │  │ Create Form  │  │  View List   │      │
│  │  (SSR)       │  │  (Dynamic)   │  │  (Dynamic)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                 │                 │              │
│           └─────────────────┴─────────────────┘              │
│                            │                                 │
│                    ┌───────▼───────┐                        │
│                    │   API Client   │                        │
│                    └───────┬───────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTP/REST
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                   Django Backend (API)                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         content_types_app (DRF ViewSet)             │    │
│  │  • ContentType model (PostgreSQL)                   │    │
│  │  • ContentTypeField model (PostgreSQL)              │    │
│  │  • Schema definition & validation                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │       dynamic_content_app (API Views)               │    │
│  │  • DynamicContent model (MongoEngine)               │    │
│  │  • Content validation against schema                │    │
│  │  • CRUD operations for content                      │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
             │                               │
             ▼                               ▼
    ┌─────────────────┐          ┌─────────────────┐
    │   PostgreSQL    │          │     MongoDB     │
    │  (Schemas)      │          │  (Content Data) │
    └─────────────────┘          └─────────────────┘
```

### Directory Structure

```
dynamic-form/
├── backend/                           # Django backend
│   ├── content_types_app/             # Content type schema management
│   │   ├── models.py                  # ContentType, ContentTypeField
│   │   ├── serializers.py             # DRF serializers
│   │   ├── views.py                   # ContentTypeViewSet (read-only)
│   │   └── admin.py                   # Django admin configuration
│   │
│   ├── dynamic_content_app/           # Dynamic content management
│   │   ├── mongodb.py                 # DynamicContent (MongoEngine)
│   │   ├── validators.py              # Schema-based validation
│   │   ├── views.py                   # CRUD API views
│   │   └── urls.py                    # URL routing
│   │
│   └── dynamic_form_project/          # Django project settings
│       ├── settings.py                # Database configs, CORS
│       └── urls.py                    # Main URL routing
│
└── frontend/                          # Next.js frontend
    ├── app/                           # Next.js App Router
    │   ├── page.tsx                   # Home page (SSR)
    │   ├── create/[slug]/page.tsx     # Dynamic form page
    │   ├── view/[slug]/page.tsx       # Content list page
    │   ├── layout.tsx                 # Root layout
    │   ├── error.tsx                  # Error boundary
    │   └── loading.tsx                # Loading UI
    │
    ├── components/                    # React components
    │   ├── dynamic-form.tsx           # Dynamic form renderer
    │   ├── delete-button.tsx          # Delete action component
    │   └── ui/                        # shadcn/ui components
    │
    └── lib/                           # Utilities
        ├── api.ts                     # API client (axios)
        ├── types.ts                   # TypeScript types
        └── utils.ts                   # Helper functions
```

---

## Data Model

### Backend Models

#### 1. ContentType (PostgreSQL)
**Purpose**: Defines the schema/blueprint for a content type

```python
# Location: backend/content_types_app/models.py

class ContentType(models.Model):
    name            # Unique identifier (snake_case, e.g., "blog_post")
    display_name    # Human-readable name (e.g., "Blog Post")
    description     # Optional description
    created_at      # Timestamp
    updated_at      # Timestamp
    is_active       # Boolean flag
    
    # Relationships
    fields          # Reverse FK to ContentTypeField
```

**Key Constraints**:
- `name` must be unique, lowercase, alphanumeric + underscores
- Must start with a letter

#### 2. ContentTypeField (PostgreSQL)
**Purpose**: Defines individual fields within a content type

```python
# Location: backend/content_types_app/models.py

class ContentTypeField(models.Model):
    content_type    # FK to ContentType
    field_name      # Field identifier (snake_case)
    display_name    # Human-readable label
    field_type      # Choice: text, textarea, number, email, date, boolean, select
    is_required     # Boolean
    default_value   # Optional default
    help_text       # Helper text for UI
    choices         # JSONField (for select fields)
    order           # Display order
    created_at      # Timestamp
```

**Supported Field Types**:
```python
FIELD_TYPE_CHOICES = [
    ('text', 'Text'),
    ('textarea', 'Text Area'),
    ('number', 'Number'),
    ('email', 'Email'),
    ('date', 'Date'),
    ('boolean', 'Boolean'),
    ('select', 'Select'),
]
```

#### 3. DynamicContent (MongoDB)
**Purpose**: Stores actual content instances (schema-less)

```python
# Location: backend/dynamic_content_app/mongodb.py

class DynamicContent(DynamicDocument):  # MongoEngine
    content_type    # String (references ContentType.name)
    created_at      # DateTime
    updated_at      # DateTime
    # ... any additional fields based on content type schema
```

**Key Features**:
- **DynamicDocument**: Allows arbitrary fields
- Fields are validated against `ContentType` schema before saving
- Automatically updates `updated_at` on save

### Frontend Types

```typescript
// Location: frontend/lib/types.ts

interface ContentType {
  id: number;
  name: string;              // e.g., "blog_post"
  display_name: string;      // e.g., "Blog Post"
  description: string;
  is_active: boolean;
  fields: FormField[];
  created_at: string;
  updated_at: string;
  field_count?: number;      // For list view
}

interface FormField {
  id: number;
  field_name: string;        // e.g., "title"
  display_name: string;      // e.g., "Title"
  field_type: FieldType;
  is_required: boolean;
  default_value: string | null;
  help_text: string;
  choices: string[] | null;  // For select fields
  order: number;
}

type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'date' | 'boolean' | 'select';

interface FormData {
  [key: string]: any;
}
```

---

## API Reference

### Base URL
```
http://localhost:8000/api
```

### Content Types API

#### 1. List All Content Types
```http
GET /api/content-types/
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "blog_post",
    "display_name": "Blog Post",
    "description": "Blog post content type",
    "is_active": true,
    "field_count": 5,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### 2. Get Content Type Details
```http
GET /api/content-types/{id or name}/
```

**Response**:
```json
{
  "id": 1,
  "name": "blog_post",
  "display_name": "Blog Post",
  "description": "Blog post content type",
  "is_active": true,
  "fields": [
    {
      "id": 1,
      "field_name": "title",
      "display_name": "Title",
      "field_type": "text",
      "is_required": true,
      "default_value": null,
      "help_text": "Enter the blog title",
      "choices": null,
      "order": 0
    },
    {
      "id": 2,
      "field_name": "status",
      "display_name": "Status",
      "field_type": "select",
      "is_required": true,
      "default_value": "draft",
      "help_text": "",
      "choices": ["draft", "published"],
      "order": 1
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### 3. Get Content Type Schema
```http
GET /api/content-types/{id}/schema/
```

**Response**: Simplified schema format

### Dynamic Content API

#### 1. List Content by Type
```http
GET /api/content/{content_type_name}/
```

**Response**:
```json
{
  "content_type": "blog_post",
  "count": 2,
  "results": [
    {
      "id": "507f1f77bcf86cd799439011",
      "content_type": "blog_post",
      "title": "My First Post",
      "status": "published",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 2. Create Content
```http
POST /api/content/{content_type_name}/
Content-Type: application/json

{
  "title": "New Post",
  "status": "draft"
}
```

**Response**:
```json
{
  "message": "Content created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "content_type": "blog_post",
    "title": "New Post",
    "status": "draft",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 3. Get Specific Content
```http
GET /api/content/{content_type_name}/{content_id}/
```

#### 4. Update Content
```http
PUT /api/content/{content_type_name}/{content_id}/
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "published"
}
```

#### 5. Delete Content
```http
DELETE /api/content/{content_type_name}/{content_id}/
```

**Response**: 204 No Content

#### 6. Content Overview
```http
GET /api/content/
```

**Response**: Summary of all content types and their counts

---

## Frontend Architecture

### Next.js App Router Structure

#### 1. Server Components (SSR)
```typescript
// app/page.tsx - Home page
// Fetches content types at build/request time
export default async function HomePage() {
  const contentTypes = await contentTypesApi.getAll();
  // Render content type cards
}
```

#### 2. Client Components
```typescript
// components/dynamic-form.tsx
"use client"

export function DynamicForm({ contentType, onSuccess }: DynamicFormProps) {
  // Dynamic form rendering based on schema
  // Field type mapping to shadcn/ui components
  // Form validation and submission
}
```

#### 3. Dynamic Routes
```typescript
// app/create/[slug]/page.tsx
// Generates form page for any content type

export default async function CreatePage({ params }: { params: { slug: string } }) {
  const contentType = await contentTypesApi.getByName(params.slug);
  return <DynamicForm contentType={contentType} />;
}
```

### API Client Pattern

```typescript
// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Content Types API
export const contentTypesApi = {
  getAll: async () => { /* ... */ },
  getById: async (id: number) => { /* ... */ },
  getByName: async (name: string) => { /* ... */ },
};

// Content API
export const contentApi = {
  getAll: async (contentType: string) => { /* ... */ },
  create: async (contentType: string, data: FormData) => { /* ... */ },
  update: async (contentType: string, id: string, data: FormData) => { /* ... */ },
  delete: async (contentType: string, id: string) => { /* ... */ },
};

// Error handling
export function handleApiError(error: any): ApiError { /* ... */ }
```

---

## Key Patterns

### 1. Schema Validation Pattern

**Backend Flow**:
```python
# validators.py
def validate_dynamic_content(content_type_name, data):
    # 1. Fetch content type schema from PostgreSQL
    content_type = ContentType.objects.get(name=content_type_name)
    
    # 2. Iterate through fields
    for field in content_type.fields.all():
        # 3. Check required fields
        # 4. Type-specific validation (number, email, select, etc.)
        # 5. Build validated_data dict
    
    # 6. Raise ValidationError if any issues
    # 7. Return validated_data
```

**Usage in View**:
```python
def post(self, request, content_type_name):
    validated_data = validate_dynamic_content(content_type_name, request.data)
    doc = DynamicContent(content_type=content_type_name, **validated_data)
    doc.save()
```

### 2. Dynamic Form Rendering Pattern

**Frontend Component**:
```typescript
// components/dynamic-form.tsx

const renderField = (field: FormField) => {
  switch (field.field_type) {
    case 'textarea':
      return <Textarea {...commonProps} />;
    case 'number':
      return <Input type="number" {...commonProps} />;
    case 'email':
      return <Input type="email" {...commonProps} />;
    case 'date':
      return <Input type="date" {...commonProps} />;
    case 'boolean':
      return <Switch {...commonProps} />;
    case 'select':
      return (
        <Select {...commonProps}>
          {choices?.map(choice => <SelectItem value={choice} />)}
        </Select>
      );
    default: // text
      return <Input type="text" {...commonProps} />;
  }
};
```

**Field Sorting**:
```typescript
const sortedFields = [...contentType.fields].sort((a, b) => a.order - b.order);
```

### 3. Error Handling Pattern

**Backend**:
```python
try:
    validated_data = validate_dynamic_content(content_type_name, request.data)
    # ... process
except ValidationError as e:
    return Response({'error': str(e)}, status=400)
except ContentType.DoesNotExist:
    return Response({'error': 'Content type not found'}, status=404)
```

**Frontend**:
```typescript
try {
  await contentApi.create(contentType.name, formData);
  toast({ title: "Success!", description: "Created successfully" });
} catch (error) {
  const apiError = handleApiError(error);
  toast({
    title: "Error",
    description: apiError.error,
    variant: "destructive",
  });
}
```

### 4. MongoDB Connection Pattern

```python
# mongodb.py
def get_mongodb_connection():
    mongodb_settings = settings.MONGODB_SETTINGS
    
    # Support two connection methods:
    # 1. Full connection URL (MongoDB Atlas)
    if mongodb_settings['host'].startswith('mongodb'):
        return connect(host=mongodb_settings['host'])
    
    # 2. Individual parameters (local MongoDB)
    else:
        return connect(
            db=mongodb_settings.get('db'),
            host=mongodb_settings.get('host'),
            port=mongodb_settings.get('port')
        )
```

---

## Development Workflow

### Backend Development

#### 1. Adding a New Field Type

**Step 1**: Update `FIELD_TYPE_CHOICES` in both models:
```python
# content_types_app/models.py
FIELD_TYPE_CHOICES = [
    # ... existing
    ('url', 'URL'),  # New field type
]
```

**Step 2**: Add validation logic:
```python
# dynamic_content_app/validators.py
def validate_dynamic_content(content_type_name, data):
    # ...
    elif field.field_type == 'url':
        # Validate URL format
        if not is_valid_url(field_value):
            errors[field_name] = f"{field.display_name} must be a valid URL"
        else:
            validated_data[field_name] = str(field_value)
```

**Step 3**: Update frontend form renderer:
```typescript
// components/dynamic-form.tsx
case 'url':
  return (
    <Input
      type="url"
      placeholder={`Enter ${display_name.toLowerCase()}`}
      {...commonProps}
    />
  );
```

#### 2. Creating Content Types via Admin

1. Navigate to `http://localhost:8000/admin/`
2. Go to **Content Types** → **Add Content Type**
3. Fill in:
   - Name (snake_case)
   - Display Name
   - Description
4. Add fields inline (click "+ Add another Content Type Field")
5. For each field:
   - Field Name (snake_case)
   - Display Name
   - Field Type (select from dropdown)
   - Required checkbox
   - Help Text (optional)
   - Choices (JSON array for select fields)
   - Order (for display sequence)

### Frontend Development

#### 1. Adding a New Page

```typescript
// app/my-page/page.tsx
import { contentTypesApi } from '@/lib/api';

export default async function MyPage() {
  const data = await contentTypesApi.getAll();
  
  return (
    <div>
      {/* Your page content */}
    </div>
  );
}
```

#### 2. Creating a New Component

```typescript
// components/my-component.tsx
"use client"  // If using hooks or interactivity

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function MyComponent() {
  const [state, setState] = useState(null);
  
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

#### 3. Making API Calls

```typescript
// In a Server Component
const data = await contentTypesApi.getAll();

// In a Client Component
const [data, setData] = useState([]);

useEffect(() => {
  async function fetchData() {
    const result = await contentTypesApi.getAll();
    setData(result);
  }
  fetchData();
}, []);
```

---

## Common Tasks

### Task 1: Add a New Field Type

**Example**: Adding a "rich_text" field type

1. **Backend - Models**:
```python
# content_types_app/models.py
FIELD_TYPE_CHOICES = [
    # ...
    ('rich_text', 'Rich Text'),
]
```

2. **Backend - Validator**:
```python
# dynamic_content_app/validators.py
elif field.field_type == 'rich_text':
    # Validate HTML or Markdown
    validated_data[field_name] = str(field_value)
```

3. **Frontend - Form Renderer**:
```typescript
// components/dynamic-form.tsx
case 'rich_text':
  return <RichTextEditor {...commonProps} />;
```

4. **Frontend - Types**:
```typescript
// lib/types.ts
type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'date' | 'boolean' | 'select' | 'rich_text';
```

### Task 2: Modify API Response Format

**Backend**:
```python
# content_types_app/serializers.py
class ContentTypeSerializer(serializers.ModelSerializer):
    custom_field = serializers.SerializerMethodField()
    
    def get_custom_field(self, obj):
        return "custom_value"
```

**Frontend - Update Types**:
```typescript
// lib/types.ts
interface ContentType {
  // ... existing
  custom_field?: string;
}
```

### Task 3: Add Server-Side Filtering

**Backend**:
```python
# dynamic_content_app/views.py
def get(self, request, content_type_name):
    # Get query params
    status_filter = request.query_params.get('status')
    
    # Query with filter
    query = {'content_type': content_type_name}
    if status_filter:
        query['status'] = status_filter
    
    documents = DynamicContent.objects(**query)
    # ...
```

**Frontend**:
```typescript
// lib/api.ts
export const contentApi = {
  getAll: async (contentType: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    const response = await axios.get(
      `${API_BASE_URL}/content/${contentType}/?${params}`
    );
    return response.data;
  },
};
```

### Task 4: Add Field-Level Validation

**Backend - Custom Validator**:
```python
# dynamic_content_app/validators.py
def validate_custom_field(field, value):
    """Custom validation logic"""
    if field.field_name == 'age' and int(value) < 0:
        raise ValidationError("Age must be positive")
    return value

# In validate_dynamic_content:
validated_value = validate_custom_field(field, field_value)
```

### Task 5: Implement Content Search

**Backend**:
```python
# dynamic_content_app/views.py
def get(self, request, content_type_name):
    search_query = request.query_params.get('search', '')
    
    if search_query:
        # MongoDB text search (requires text index)
        documents = DynamicContent.objects(
            content_type=content_type_name
        ).search_text(search_query)
    else:
        documents = DynamicContent.objects(content_type=content_type_name)
```

**Frontend**:
```typescript
// Add search input to view page
const [search, setSearch] = useState('');
const results = await contentApi.getAll(contentType, { search });
```

---

## Environment Configuration

### Backend (.env)

```bash
DEBUG=True
SECRET_KEY=your-secret-key-here

# MongoDB - Method 1: Connection URL
MONGODB_URL=mongodb://localhost:27017/dynamic_form_db

# MongoDB - Method 2: Individual params
MONGODB_NAME=dynamic_form_db
MONGODB_HOST=localhost
MONGODB_PORT=27017

ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## Testing Checklist

### Backend Tests
- [ ] Content type creation via admin
- [ ] Field validation (required, types, choices)
- [ ] MongoDB connection
- [ ] API endpoints respond correctly
- [ ] CORS headers present

### Frontend Tests
- [ ] Form renders all field types correctly
- [ ] Form submission creates content
- [ ] Error messages display properly
- [ ] Loading states work
- [ ] Success toasts appear
- [ ] Delete confirmation works
- [ ] SSR works (view page source)

---

## Debugging Tips

### Common Issues

**1. MongoDB Connection Failed**
```bash
# Check MongoDB is running
sudo systemctl status mongod
sudo systemctl start mongod

# Check connection string in .env
```

**2. CORS Errors**
```python
# backend/dynamic_form_project/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
CORS_ALLOW_CREDENTIALS = True
```

**3. Form Not Rendering**
- Check content type exists in admin
- Verify API endpoint returns correct data
- Check browser console for errors
- Ensure field types are supported

**4. Content Not Saving**
- Check validation errors in API response
- Verify required fields are filled
- Check MongoDB write permissions
- Review backend logs for validation errors

---

## Agent Instructions

### When Modifying This System:

1. **Adding Fields**: Always update backend models, validators, and frontend form renderer
2. **API Changes**: Update both backend views and frontend API client
3. **Type Safety**: Keep TypeScript types in sync with Django models
4. **Validation**: Implement validation on both backend (required) and frontend (UX)
5. **Error Handling**: Always use try-catch and provide meaningful error messages
6. **Testing**: Test new field types across all CRUD operations

### Code Style:
- **Backend**: Follow Django conventions, use docstrings
- **Frontend**: Use TypeScript, functional components, async/await
- **Components**: Client components marked with `"use client"`
- **API**: RESTful naming, proper HTTP status codes

### Security Considerations:
- CSRF exempt on API views (using CORS instead)
- Validate all input data against schemas
- Sanitize MongoDB queries
- Environment variables for sensitive data

---

## Quick Reference

### Start Development Servers

**Backend**:
```bash
cd backend
source ../.venv/bin/activate
python manage.py runserver
```

**Frontend**:
```bash
cd frontend
npm run dev
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

### Key Files for Common Changes
- Add field type: `models.py`, `validators.py`, `dynamic-form.tsx`, `types.ts`
- Modify API: `views.py`, `serializers.py`, `api.ts`
- Add page: `app/[name]/page.tsx`
- Add component: `components/[name].tsx`

---

**Last Updated**: December 2024  
**Version**: 1.0
