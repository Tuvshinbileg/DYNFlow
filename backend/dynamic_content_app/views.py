"""
Views for managing dynamic content stored in MongoDB
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .mongodb import DynamicContent, get_mongodb_connection
from .validators import validate_dynamic_content
from content_types_app.models import ContentType
from bson import ObjectId
from bson.errors import InvalidId

# Initialize MongoDB connection
get_mongodb_connection()


@method_decorator(csrf_exempt, name='dispatch')
class DynamicContentListView(APIView):
    """
    List all content for a specific content type or create new content
    """

    def get(self, request, content_type_name):
        """Get all content entries for a content type"""
        try:
            # Verify content type exists
            ContentType.objects.get(name=content_type_name, is_active=True)
        except ContentType.DoesNotExist:
            return Response(
                {'error': f"Content type '{content_type_name}' not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Query MongoDB for all documents of this content type
        documents = DynamicContent.objects(content_type=content_type_name)

        # Convert to list of dictionaries
        results = [doc.to_dict() for doc in documents]

        return Response({
            'content_type': content_type_name,
            'count': len(results),
            'results': results
        })

    def post(self, request, content_type_name):
        """Create new content entry"""
        try:
            # Validate data against content type schema
            validated_data = validate_dynamic_content(content_type_name, request.data)

            # Create new MongoDB document
            doc = DynamicContent(content_type=content_type_name, **validated_data)
            doc.save()

            # Convert to dict to ensure JSON serialization
            result_data = doc.to_dict()

            return Response(
                {
                    'message': 'Content created successfully',
                    'data': result_data
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            import traceback
            return Response(
                {
                    'error': str(e),
                    'type': type(e).__name__
                },
                status=status.HTTP_400_BAD_REQUEST
            )


@method_decorator(csrf_exempt, name='dispatch')
class DynamicContentDetailView(APIView):
    """
    Retrieve, update, or delete a specific content entry
    """

    def get(self, request, content_type_name, content_id):
        """Get a specific content entry"""
        try:
            doc = DynamicContent.objects.get(
                id=ObjectId(content_id),
                content_type=content_type_name
            )
            return Response(doc.to_dict())

        except (DynamicContent.DoesNotExist, InvalidId):
            return Response(
                {'error': 'Content not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request, content_type_name, content_id):
        """Update a content entry"""
        try:
            # Get existing document
            doc = DynamicContent.objects.get(
                id=ObjectId(content_id),
                content_type=content_type_name
            )

            # Validate new data
            validated_data = validate_dynamic_content(content_type_name, request.data)

            # Update document fields
            for key, value in validated_data.items():
                setattr(doc, key, value)

            doc.save()

            return Response({
                'message': 'Content updated successfully',
                'data': doc.to_dict()
            })

        except (DynamicContent.DoesNotExist, InvalidId):
            return Response(
                {'error': 'Content not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, content_type_name, content_id):
        """Delete a content entry"""
        try:
            doc = DynamicContent.objects.get(
                id=ObjectId(content_id),
                content_type=content_type_name
            )
            doc.delete()

            return Response(
                {'message': 'Content deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )

        except (DynamicContent.DoesNotExist, InvalidId):
            return Response(
                {'error': 'Content not found'},
                status=status.HTTP_404_NOT_FOUND
            )


@method_decorator(csrf_exempt, name='dispatch')
class ContentTypeDataView(APIView):
    """
    Get all content for all content types (overview)
    """

    def get(self, request):
        """Get summary of all content types and their counts"""
        content_types = ContentType.objects.filter(is_active=True)

        results = []
        for ct in content_types:
            count = DynamicContent.objects(content_type=ct.name).count()
            results.append({
                'content_type': ct.name,
                'display_name': ct.display_name,
                'count': count
            })

        return Response(results)