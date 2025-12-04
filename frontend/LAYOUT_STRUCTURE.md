# Frontend Layout Structure

## 📁 New Layout Architecture

The app now uses **Next.js Route Groups** to separate authentication pages from main app pages.

### Directory Structure

```
app/
├── layout.tsx                    # Root layout (global providers)
│
├── (auth)/                       # Auth route group
│   ├── layout.tsx               # Auth layout (no sidebar/header)
│   ├── login/
│   │   └── page.tsx             # Login page
│   └── register/
│       └── page.tsx             # Register page
│
├── (main)/                       # Main app route group
│   ├── layout.tsx               # Main layout (with sidebar/header)
│   ├── page.tsx                 # Home page
│   ├── create/
│   │   └── [slug]/
│   │       └── page.tsx         # Create dynamic content
│   ├── crud/
│   │   └── page.tsx             # CRUD operations
│   ├── nocodb/
│   │   ├── page.tsx             # NocoDB tables list
│   │   └── [table]/
│   │       └── page.tsx         # NocoDB table view
│   └── view/
│       └── [slug]/
│           └── page.tsx         # View dynamic content
│
├── favicon.ico
├── globals.css
└── not-found.tsx
```

## 🎯 How It Works

### Route Groups
- Folders with `(name)` are **route groups**
- They organize code without adding to the URL path
- Each group can have its own layout

### Example URLs
```
/login           → Uses (auth) layout (no sidebar/header)
/register        → Uses (auth) layout (no sidebar/header)
/                → Uses (main) layout (with sidebar/header)
/nocodb          → Uses (main) layout (with sidebar/header)
/nocodb/users    → Uses (main) layout (with sidebar/header)
/create/blog     → Uses (main) layout (with sidebar/header)
```

## 📝 Layout Files

### 1. Root Layout (`app/layout.tsx`)
**Purpose**: Global configuration

**Contains**:
- ✅ HTML structure
- ✅ Font configuration
- ✅ Global CSS
- ✅ AuthProvider (authentication state)
- ✅ Toaster (notifications)

**Does NOT contain**:
- ❌ Sidebar
- ❌ Header
- ❌ Navigation

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Auth Layout (`app/(auth)/layout.tsx`)
**Purpose**: Clean layout for authentication pages

**Contains**:
- ✅ Minimal wrapper
- ✅ Full-screen container

**Does NOT contain**:
- ❌ Sidebar
- ❌ Header
- ❌ Navigation

```tsx
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
```

### 3. Main Layout (`app/(main)/layout.tsx`)
**Purpose**: Full app layout with navigation

**Contains**:
- ✅ Sidebar
- ✅ Header
- ✅ Navigation
- ✅ SidebarProvider

```tsx
export default function MainLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full">
        <AppHeader />
        {children}
      </main>
    </SidebarProvider>
  );
}
```

## 🎨 Visual Representation

### Auth Pages (`/login`, `/register`)
```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│          ┌─────────────┐            │
│          │   Login     │            │
│          │   Form      │            │
│          └─────────────┘            │
│                                      │
│                                      │
└──────────────────────────────────────┘
   Clean, centered, no navigation
```

### Main App Pages (`/`, `/nocodb`, etc.)
```
┌──────────────────────────────────────┐
│ ┌────────┐ Header               👤  │
├─┴────────┴──────────────────────────┤
│ │ 📱 Home                           │
│ │ 📊 NocoDB         Content         │
│ │ ➕ Create         Area            │
│ │ 👁️ View                           │
│ │                                   │
│ Sidebar           Main Content      │
└──────────────────────────────────────┘
   Full app with sidebar and header
```

## 🔄 Migration Benefits

### Before
- ❌ All pages had sidebar/header (including login/register)
- ❌ Auth pages looked cluttered
- ❌ Inconsistent with auth page best practices

### After
- ✅ Auth pages are clean and focused
- ✅ Main app pages have full navigation
- ✅ Better user experience
- ✅ Follows industry standards

## 🛠️ Adding New Pages

### Add Auth Page
```bash
# Create new auth page (no sidebar/header)
app/(auth)/forgot-password/page.tsx
```

### Add Main App Page
```bash
# Create new main page (with sidebar/header)
app/(main)/dashboard/page.tsx
```

## 📋 Testing Checklist

Test the layout changes:

- [ ] Visit `/login` - Should NOT see sidebar/header
- [ ] Visit `/register` - Should NOT see sidebar/header
- [ ] Visit `/` - Should see sidebar/header
- [ ] Visit `/nocodb` - Should see sidebar/header
- [ ] Visit `/nocodb/users` - Should see sidebar/header
- [ ] Navigate between pages - Layouts switch correctly
- [ ] Toast notifications work on all pages
- [ ] Authentication state works everywhere

## 🎯 Key Points

1. **Route Groups** (`(name)`) don't affect URLs
2. **Auth pages** (`/login`, `/register`) are standalone
3. **Main pages** have full navigation
4. **Root layout** provides global functionality
5. **Easy to add** new pages to either group

## 🚀 Result

Your app now has:
- ✅ Clean authentication pages (no distractions)
- ✅ Full-featured main app (with navigation)
- ✅ Better UX and visual hierarchy
- ✅ Industry-standard layout patterns
