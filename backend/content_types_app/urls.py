from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContentTypeViewSet, ContentTypeSyncNocoView

router = DefaultRouter()
router.register(r'', ContentTypeViewSet, basename='contenttype')

urlpatterns = [
    path('', include(router.urls)),
    path('sync-noco/', ContentTypeSyncNocoView.as_view(), name='sync-noco'),
]
