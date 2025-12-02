from rest_framework import serializers
from .models import ContentType, ContentTypeField


class ContentTypeFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentTypeField
        fields = [
            'id', 
            'field_name', 
            'display_name', 
            'field_type', 
            'is_required', 
            'default_value',
            'help_text', 
            'choices', 
            'order'
        ]


class ContentTypeSerializer(serializers.ModelSerializer):
    fields = ContentTypeFieldSerializer(many=True, read_only=True)
    
    class Meta:
        model = ContentType
        fields = [
            'id', 
            'name', 
            'display_name', 
            'description', 
            'is_active',
            'fields',
            'created_at', 
            'updated_at'
        ]


class ContentTypeListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing content types"""
    field_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ContentType
        fields = ['id', 'name', 'display_name', 'description', 'is_active', 'field_count', 'created_at']
    
    def get_field_count(self, obj):
        return obj.fields.count()
