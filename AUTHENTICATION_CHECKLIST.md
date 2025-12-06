# Authentication Setup Checklist

## ✅ Quick Setup Steps

### Backend (Django)

1. **Update `backend/dynamic_form_project/settings.py`**:
   ```python
   INSTALLED_APPS = [
       # ... existing apps
       'rest_framework.authtoken',  # Add
       'authentication',             # Add
   ]
   
   AUTH_USER_MODEL = 'authentication.User'
   
   REST_FRAMEWORK = {
       'DEFAULT_AUTHENTICATION_CLASSES': [
           'rest_framework.authentication.TokenAuthentication',
       ],
   }
   
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",
   ]
   CORS_ALLOW_CREDENTIALS = True
   ```

2. **Update `backend/dynamic_form_project/urls.py`**:
   ```python
   urlpatterns = [
       path('admin/', admin.site.urls),
       path('api/auth/', include('authentication.urls')),  # Add this line
       # ... existing URLs
   ]
   ```

3. **Run migrations**:
   ```bash
   cd backend
   python manage.py makemigrations authentication
   python manage.py migrate
   python manage.py createsuperuser  # Optional
   python manage.py runserver
   ```

### Frontend (Next.js)

1. **Create `.env.local`** (if not exists):
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env.local
   ```

2. **Start frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the pages**:
   - Login: http://localhost:3000/login
   - Register: http://localhost:3000/register

## 📂 Files Created

### Backend
- ✅ `backend/authentication/models.py` - Custom User model
- ✅ `backend/authentication/serializers.py` - DRF serializers
- ✅ `backend/authentication/views.py` - API views
- ✅ `backend/authentication/urls.py` - URL routes
- ✅ `backend/authentication/admin.py` - Admin configuration
- ✅ `backend/authentication/apps.py` - App configuration

### Frontend
- ✅ `frontend/lib/auth.ts` - Auth service & API calls
- ✅ `frontend/contexts/auth-context.tsx` - Global auth state
- ✅ `frontend/app/login/page.tsx` - Login page
- ✅ `frontend/app/register/page.tsx` - Register page
- ✅ `frontend/app/layout.tsx` - Updated with AuthProvider

## 🧪 Testing Commands

### Backend
```bash
# Test registration
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test123!","password_confirm":"Test123!"}'

# Test login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
```

### Frontend
1. Go to http://localhost:3000/register
2. Fill form and submit
3. Go to http://localhost:3000/login
4. Login with your credentials

## 🔍 Verification

Check these to ensure everything works:

- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 3000
- [ ] Can access login page
- [ ] Can access register page
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Token saved in localStorage
- [ ] User redirected after login
- [ ] Toast notifications appear

## 🚀 Ready to Use!

Your authentication system is complete with:
- ✅ User registration with validation
- ✅ User login with token generation
- ✅ Token-based authentication
- ✅ Profile management APIs
- ✅ Password change functionality
- ✅ Global authentication state
- ✅ Beautiful UI with shadcn components
