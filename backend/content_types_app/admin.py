from django.contrib import admin
from django.urls import path
from django.http import HttpResponseRedirect
from django.utils.html import format_html
from django.contrib import messages
from django.shortcuts import redirect
from django.urls import reverse
from .models import ContentType, ContentTypeField
from .views import ContentTypeSyncNocoView


class ContentTypeFieldInline(admin.TabularInline):
    model = ContentTypeField
    extra = 1
    fields = ['field_name', 'display_name', 'field_type', 'is_required', 'choices', 'help_text', 'order']


@admin.register(ContentType)
class ContentTypeAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'display_name']
    inlines = [ContentTypeFieldInline]
    readonly_fields = ['created_at', 'updated_at']
    change_list_template = 'admin/content_types_app/contenttype/change_list.html'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'display_name', 'description', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('sync_noco/', self.admin_site.admin_view(self.sync_noco_view), name='sync_noco'),
        ]
        return custom_urls + urls
    
    def changelist_view(self, request, extra_context=None):
        """Add sync button to changelist view"""
        extra_context = extra_context or {}
        extra_context['sync_noco_url'] = reverse('admin:sync_noco')
        return super().changelist_view(request, extra_context=extra_context)
    
    def sync_noco_view(self, request):
        """Handle sync with NocoDB"""
        from noco import nocoapi
        from .sync_content_types import nocodb_tables_sync
        import traceback
        try:
            nocodb_tables = nocoapi.get_nocodb_tables()
            
            if not nocodb_tables or 'error' in nocodb_tables:
                error_msg = nocodb_tables.get('error', 'Failed to fetch NocoDB tables') if isinstance(nocodb_tables, dict) else str(nocodb_tables)
                messages.error(request, f'Error syncing with NocoDB: {error_msg}')
            else:
                nocodb_tables_sync(nocodb_tables['list'])
                messages.success(request, 'Content types synced with NocoDB successfully')
        except Exception as e:
            error_trace = traceback.format_exc()
            messages.error(request, f'Error syncing with NocoDB: {str(e)}')
        
        return redirect('admin:content_types_app_contenttype_changelist')


@admin.register(ContentTypeField)
class ContentTypeFieldAdmin(admin.ModelAdmin):
    list_display = ['content_type', 'field_name', 'display_name', 'field_type', 'is_required', 'order']
    list_filter = ['content_type', 'field_type', 'is_required']
    search_fields = ['field_name', 'display_name']
