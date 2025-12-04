# NocoDB Setup Guide

## Prerequisites

1. **NocoDB Instance Running**
   - Default URL: `http://localhost:8080`
   - You can install NocoDB using Docker:
     ```bash
     docker run -d --name nocodb \
       -v "$(pwd)/nocodb:/usr/app/data" \
       -p 8080:8080 \
       nocodb/nocodb:latest
     ```

2. **API Token**
   - Log in to your NocoDB instance
   - Go to Account Settings → Tokens
   - Create a new API token
   - Copy the token

## Environment Variables

Add these variables to your `.env` file:

```env
# NocoDB Configuration
NEXT_PUBLIC_NOCODB_API_URL=http://localhost:8080
NEXT_PUBLIC_NOCODB_API_TOKEN=your_api_token_here
```

## Features

### 1. Tables List (`/nocodb`)
- View all tables from your NocoDB base
- See row counts for each table
- Quick access links to each table

### 2. Dynamic Table View (`/nocodb/[table]`)
- **View Records**: Browse all records in a table with pagination
- **Add Record**: Create new records with a form dialog
- **Edit Record**: Update existing records
- **Delete Record**: Remove records with confirmation
- **Refresh**: Reload table data
- **Pagination**: Navigate through large datasets (10 records per page)

### 3. Sidebar Integration
- NocoDB section in the sidebar
- "All Tables" overview link
- Collapsible list of tables with row counts
- Quick navigation to any table

## Usage

1. Ensure NocoDB is running
2. Set your environment variables
3. Navigate to `/nocodb` to see all tables
4. Click on any table to view and manage its records
5. Use the action buttons to:
   - Add new records
   - Edit existing records
   - Delete records
   - Refresh data

## Technical Details

### API Integration
- Uses official `nocodb-sdk` package
- Automatic metadata fetching
- Dynamic column detection
- Type-safe API calls

### UI Components
- shadcn/ui table component
- Dialog forms for CRUD operations
- Toast notifications for actions
- Responsive design
- Loading states

### Features
- Server-side rendering for initial data
- Client-side interactions for CRUD
- Pagination support
- Primary key detection
- Auto-increment field handling
- Required field validation indicators
