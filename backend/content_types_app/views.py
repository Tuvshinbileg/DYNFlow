from logging import getLogger

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ContentType
from .serializers import ContentTypeSerializer, ContentTypeListSerializer
from .sync_content_types import nocodb_tables_sync

logger = getLogger(__name__)


class ContentTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing content types and their schema definitions
    """
    queryset = ContentType.objects.filter(is_active=True)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ContentTypeListSerializer
        return ContentTypeSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Get a specific content type by ID or name"""
        pk = kwargs.get('pk')
        
        # Try to get by ID first
        try:
            instance = ContentType.objects.get(pk=pk, is_active=True)
        except (ContentType.DoesNotExist, ValueError):
            # If not found or not a valid ID, try by name
            try:
                instance = ContentType.objects.get(name=pk, is_active=True)
            except ContentType.DoesNotExist:
                return Response(
                    {'error': 'Content type not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def schema(self, request, pk=None):
        """Get the JSON schema for a content type"""
        content_type = self.get_object()
        
        schema = {
            'name': content_type.name,
            'display_name': content_type.display_name,
            'description': content_type.description,
            'fields': []
        }
        
        for field in content_type.fields.all():
            field_schema = {
                'name': field.field_name,
                'display_name': field.display_name,
                'type': field.field_type,
                'required': field.is_required,
                'help_text': field.help_text,
                'default': field.default_value,
            }
            
            if field.field_type == 'select' and field.choices:
                field_schema['options'] = field.choices
            
            schema['fields'].append(field_schema)
        
        return Response(schema)


class ContentTypeSyncNocoView(APIView):
    """
    Sync content types with NocoDB
    """

    def post(self, request):
        """Trigger sync with NocoDB"""
        from noco import nocoapi

        try:
            nocodb_tables = nocoapi.get_nocodb_tables()
            nocodb_tables_sync(nocodb_tables)
            logger.info("NocoDB tables synced")
            return Response(
                {'message': 'Content types synced with NocoDB successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(e)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
