# 🚀 Dynamic Form System MVP (Strapi-style)

A Django + MongoDB + DRF based dynamic content management system similar to Strapi, where you can create content types dynamically in the admin panel and automatically generate forms on the frontend.

## 📋 Features

- **Dynamic Content Types**: Create custom content types with custom fields through Django admin
- **Auto-Generated Forms**: Frontend automatically generates forms based on content type schemas
- **MongoDB Storage**: Dynamic content stored in MongoDB using MongoEngine
- **RESTful API**: Complete REST API built with Django REST Framework
- **Modern UI**: Clean, responsive user interface
- **Field Types Supported**:
  - Text
  - Text Area
  - Number
  - Email
  - Date
  - Boolean
  - Select (with options)

## 🏗️ Architecture

### Backend
- **Django 5.x**: Web framework
- **Django REST Framework**: API endpoints
- **MongoEngine**: MongoDB ODM
- **PostgreSQL/SQLite**: For Django admin and content type schemas
- **MongoDB**: For dynamic content storage

### Frontend
- Vanilla JavaScript
- Modern CSS with CSS Variables
- Responsive design

## 📁 Project Structure

```
dynamic-form/
├── dynamic_form_project/       # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── content_types_app/          # Content type schema management
│   ├── models.py              # ContentType and ContentTypeField models
│   ├── admin.py               # Django admin configuration
│   ├── serializers.py         # DRF serializers
│   ├── views.py               # API views
│   └── urls.py
├── dynamic_content_app/        # Dynamic content management (MongoDB)
│   ├── mongodb.py             # MongoEngine models
│   ├── validators.py          # Content validation logic
│   ├── views.py               # Content CRUD API
│   └── urls.py
├── templates/                  # HTML templates
│   └── index.html
├── static/                     # Static files
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── requirements.txt            # Python dependencies
└── manage.py
```

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10+
- MongoDB installed and running
- Virtual environment created at `/home/tb/Workspace/mvps/dynamic-form/.venv`

### Installation

1. **Activate virtual environment**:
```bash
source /home/tb/Workspace/mvps/dynamic-form/.venv/bin/activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Create .env file**:
```bash
cp .env.example .env
```

Edit `.env` and configure your settings.

**Option 1: Using MongoDB Connection URL** (Recommended for MongoDB Atlas or remote MongoDB):
```bash
DEBUG=True
SECRET_KEY=your-secret-key-here
MONGODB_URL=mongodb://username:password@host:port/database
# Or for MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Option 2: Using Individual Parameters** (For local MongoDB):
```bash
DEBUG=True
SECRET_KEY=your-secret-key-here
MONGODB_NAME=dynamic_form_db
MONGODB_HOST=localhost
MONGODB_PORT=27017
ALLOWED_HOSTS=localhost,127.0.0.1
```

4. **Run migrations** (for Django admin/auth):
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create superuser**:
```bash
python manage.py createsuperuser
```

6. **Run the development server**:
```bash
python manage.py runserver
```

## 📖 Usage Guide

### 1. Create Content Types (Admin)

1. Go to `http://localhost:8000/admin/`
2. Login with your superuser credentials
3. Navigate to **Content Types**
4. Click **Add Content Type**
5. Fill in:
   - **Name**: Unique identifier (e.g., `blog_post`)
   - **Display Name**: Human-readable name (e.g., "Blog Post")
   - **Description**: Optional description
6. Add fields inline:
   - **Field Name**: e.g., `title`
   - **Display Name**: e.g., "Title"
   - **Field Type**: Select type (text, number, etc.)
   - **Is Required**: Check if mandatory
   - **Choices**: For select fields (JSON array)
   - **Order**: Display order

### 2. Use the Frontend

1. Go to `http://localhost:8000/`
2. **Content Types Tab**: View all available content types
3. **Create Content Tab**:
   - Select a content type from dropdown
   - Fill in the auto-generated form
   - Submit to create content
4. **View Content Tab**:
   - Select a content type
   - View all content entries
   - Delete content if needed

## 🔌 API Endpoints

### Content Types API

```
GET    /api/content-types/              # List all content types
GET    /api/content-types/{id}/         # Get specific content type
GET    /api/content-types/{id}/schema/  # Get content type schema
```

### Dynamic Content API

```
GET    /api/content/                           # Overview of all content
GET    /api/content/{content_type}/            # List content by type
POST   /api/content/{content_type}/            # Create new content
GET    /api/content/{content_type}/{id}/       # Get specific content
PUT    /api/content/{content_type}/{id}/       # Update content
DELETE /api/content/{content_type}/{id}/       # Delete content
```

## 💡 Example Usage

### Creating a "Blog Post" Content Type

1. In admin, create Content Type:
   - Name: `blog_post`
   - Display Name: "Blog Post"

2. Add fields:
   - `title` (Text, Required)
   - `content` (Text Area, Required)
   - `author` (Text, Required)
   - `published_date` (Date)
   - `status` (Select, choices: ["draft", "published"])
   - `view_count` (Number)

3. Frontend will automatically generate a form with all these fields

4. Submit content via API or frontend form

## 🔧 Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `sudo systemctl start mongod`
- Check MongoDB status: `sudo systemctl status mongod`

### Import Errors
- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Static Files Not Loading
- Run: `python manage.py collectstatic`

## 🎯 Next Steps / Enhancements

- [ ] Add authentication and authorization
- [ ] Implement file/image upload fields
- [ ] Add rich text editor for textarea fields
- [ ] Implement content versioning
- [ ] Add search and filtering
- [ ] Create admin dashboard with analytics
- [ ] Add relation fields (one-to-many, many-to-many)
- [ ] Implement API authentication (JWT)
- [ ] Add content localization
- [ ] Create Docker setup

## 📝 License

MIT License

## 👨‍💻 Author

Built as an MVP demonstration of dynamic content management system.

---

**Happy Coding! 🚀**
