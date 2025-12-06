# Authentication System Setup Guide

## 🔐 Overview
Complete user authentication system with login, register, and profile management for both Django backend and Next.js frontend.

## 📋 Table of Contents
- [Backend Setup (Django)](#backend-setup-django)
- [Frontend Setup (Next.js)](#frontend-setup-nextjs)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)

---

## Backend Setup (Django)

### 1. Update Django Settings

Add the authentication app and required configurations to `settings.py`:

```python
# backend/dynamic_form_project/settings.py

INSTALLED_APPS = [
    # ... existing apps
    'rest_framework',
    'rest_framework.authtoken',  # Add this
    'authentication',  # Add this
]

# Custom User Model
AUTH_USER_MODEL = 'authentication.User'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}

# CORS Settings (if frontend is on different port)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

### 2. Update URL Configuration

Add authentication URLs to main `urls.py`:

```python
# backend/dynamic_form_project/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),  # Add this
    # ... other URLs
]
```

### 3. Run Migrations

```bash
cd backend
python manage.py makemigrations authentication
python manage.py migrate
```

### 4. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 5. Start Backend Server

```bash
python manage.py runserver
```

Backend will run on http://localhost:8000

---

## Frontend Setup (Next.js)

### 1. Install Required Packages (Already Installed)
- axios
- react
- next
- sonner (for toasts)

### 2. Environment Variables

Create `.env.local` in the frontend directory:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. File Structure Created

```
frontend/
├── lib/
│   └── auth.ts                 # Auth service & API calls
├── contexts/
│   └── auth-context.tsx        # Global auth state
├── app/
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── register/
│   │   └── page.tsx           # Register page
│   └── layout.tsx             # Wrapped with AuthProvider
```

### 4. Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:3000

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/login/` | Login user | No |
| POST | `/api/auth/logout/` | Logout user | Yes |
| GET | `/api/auth/profile/` | Get user profile | Yes |
| PATCH | `/api/auth/profile/` | Update profile | Yes |
| POST | `/api/auth/change-password/` | Change password | Yes |
| GET | `/api/auth/check/` | Check auth status | Yes |

### Request/Response Examples

#### Register
```bash
POST /api/auth/register/
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}

# Response
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2024-12-04T10:00:00Z"
  },
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "message": "User registered successfully"
}
```

#### Login
```bash
POST /api/auth/login/
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

# Response
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "message": "Login successful"
}
```

#### Get Profile
```bash
GET /api/auth/profile/
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b

# Response
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": null,
  "avatar": null,
  "bio": null,
  "created_at": "2024-12-04T10:00:00Z",
  "updated_at": "2024-12-04T10:00:00Z"
}
```

---

## Testing

### Backend Testing

#### Test Registration
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

#### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

#### Test Profile (with token)
```bash
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Frontend Testing

1. **Navigate to Registration**:
   - Go to http://localhost:3000/register
   - Fill in the form
   - Submit

2. **Navigate to Login**:
   - Go to http://localhost:3000/login
   - Use your email and password
   - Submit

3. **Check Authentication**:
   - Open browser DevTools > Application > LocalStorage
   - Look for `auth_token`

---

## Usage Examples

### Frontend: Using Auth Context

```tsx
'use client';

import { useAuth } from '@/contexts/auth-context';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  return (
    <div>
      <h1>Welcome, {user?.first_name}!</h1>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Frontend: Protected Route

```tsx
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <div>Protected Content</div>;
}
```

### Frontend: Login Programmatically

```tsx
import { authService } from '@/lib/auth';

// Anywhere in your app
async function handleLogin() {
  try {
    const response = await authService.login({
      email: 'user@example.com',
      password: 'password123'
    });
    console.log('Logged in:', response.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

---

## Security Features

### Backend
- ✅ Password hashing with Django's PBKDF2
- ✅ Token-based authentication
- ✅ CORS protection
- ✅ Password validation (Django validators)
- ✅ Email uniqueness enforcement
- ✅ Session security

### Frontend
- ✅ Secure token storage (localStorage)
- ✅ Automatic token inclusion in requests
- ✅ Protected routes
- ✅ Client-side form validation
- ✅ Error handling with user feedback

---

## Troubleshooting

### Issue: CORS Error
**Solution**: Make sure Django settings include frontend URL in `CORS_ALLOWED_ORIGINS`

### Issue: Token not working
**Solution**: Check that token is being sent with `Authorization: Token YOUR_TOKEN` header

### Issue: Registration fails
**Solution**: Check password requirements (min 8 chars, not too common, not all numeric)

### Issue: User not found after login
**Solution**: Make sure `AUTH_USER_MODEL` is set before running migrations

---

## Next Steps

### 1. Add Profile Page
```tsx
// app/profile/page.tsx
import { useAuth } from '@/contexts/auth-context';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  // ... profile UI
}
```

### 2. Add Middleware for Protected Routes
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};
```

### 3. Add Social Authentication
- Google OAuth
- GitHub OAuth
- Facebook Login

### 4. Add Email Verification
- Send verification email on registration
- Verify email before allowing login

### 5. Add Password Reset
- Forgot password flow
- Reset password via email

---

## 🎉 Summary

You now have a complete authentication system with:

**Backend**:
- ✅ Custom User model
- ✅ Token authentication
- ✅ Registration & Login APIs
- ✅ Profile management
- ✅ Password change
- ✅ Django admin integration

**Frontend**:
- ✅ Login page
- ✅ Register page
- ✅ Auth context (global state)
- ✅ Auth service (API calls)
- ✅ Token management
- ✅ Protected routes support

**Ready to use**: Navigate to `/login` or `/register` to get started!
