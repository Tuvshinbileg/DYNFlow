from django.contrib import admin
from .models import ContentType, ContentTypeField


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
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'display_name', 'description', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ContentTypeField)
class ContentTypeFieldAdmin(admin.ModelAdmin):
    list_display = ['content_type', 'field_name', 'display_name', 'field_type', 'is_required', 'order']
    list_filter = ['content_type', 'field_type', 'is_required']
    search_fields = ['field_name', 'display_name']
