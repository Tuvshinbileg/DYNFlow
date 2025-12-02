from django.urls import path
from .views import (
    DynamicContentListView,
    DynamicContentDetailView,
    ContentTypeDataView
)

urlpatterns = [
    # Overview of all content
    path('', ContentTypeDataView.as_view(), name='content-overview'),
    
    # Content type specific endpoints
    path('<str:content_type_name>/', DynamicContentListView.as_view(), name='content-list'),
    path('<str:content_type_name>/<str:content_id>/', DynamicContentDetailView.as_view(), name='content-detail'),
]
