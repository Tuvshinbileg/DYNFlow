"""
MongoDB connection and document models using MongoEngine
"""
from mongoengine import connect, Document, DynamicDocument, StringField, DateTimeField, DictField
from django.conf import settings
import datetime


# Connect to MongoDB
def get_mongodb_connection():
    """Initialize MongoDB connection"""
    mongodb_settings = settings.MONGODB_SETTINGS
    
    # Check if using connection URL (host contains full URI)
    if 'host' in mongodb_settings and mongodb_settings['host'].startswith('mongodb'):
        # Connection URL format (e.g., mongodb://... or mongodb+srv://...)
        return connect(host=mongodb_settings['host'])
    else:
        # Individual parameters format
        return connect(
            db=mongodb_settings.get('db'),
            host=mongodb_settings.get('host'),
            port=mongodb_settings.get('port')
        )


class DynamicContent(DynamicDocument):
    """
    Dynamic MongoDB document that can store any fields
    Strapi-style flexible content storage
    """
    content_type = StringField(required=True, max_length=100)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)
    
    meta = {
        'collection': 'dynamic_contents',
        'indexes': [
            'content_type',
            'created_at',
        ]
    }
    
    def save(self, *args, **kwargs):
        """Update the updated_at timestamp on save"""
        self.updated_at = datetime.datetime.utcnow()
        return super(DynamicContent, self).save(*args, **kwargs)
    
    def to_dict(self):
        """Convert document to dictionary"""
        from bson import ObjectId
        result = {}
        for field_name in self:
            if field_name == '_id':
                result['id'] = str(self[field_name])
            elif field_name in ['created_at', 'updated_at']:
                result[field_name] = self[field_name].isoformat() if self[field_name] else None
            else:
                value = self[field_name]
                # Convert ObjectId to string
                if isinstance(value, ObjectId):
                    result[field_name] = str(value)
                else:
                    result[field_name] = value
        return result
