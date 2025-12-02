from django.db import models
from django.core.validators import RegexValidator


class ContentType(models.Model):
    """
    Defines a dynamic content type schema (like a Strapi Content Type)
    This is stored in PostgreSQL/SQLite for admin management
    """
    FIELD_TYPE_CHOICES = [
        ('text', 'Text'),
        ('textarea', 'Text Area'),
        ('number', 'Number'),
        ('email', 'Email'),
        ('date', 'Date'),
        ('boolean', 'Boolean'),
        ('select', 'Select'),
    ]
    
    name = models.CharField(
        max_length=100, 
        unique=True,
        validators=[
            RegexValidator(
                regex='^[a-z][a-z0-9_]*$',
                message='Name must start with lowercase letter and contain only lowercase letters, numbers, and underscores'
            )
        ],
        help_text='Unique identifier for this content type (e.g., "blog_post", "product")'
    )
    display_name = models.CharField(
        max_length=200,
        help_text='Human-readable name (e.g., "Blog Post", "Product")'
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Content Type'
        verbose_name_plural = 'Content Types'
    
    def __str__(self):
        return self.display_name


class ContentTypeField(models.Model):
    """
    Defines individual fields for a content type
    """
    FIELD_TYPE_CHOICES = [
        ('text', 'Text'),
        ('textarea', 'Text Area'),
        ('number', 'Number'),
        ('email', 'Email'),
        ('date', 'Date'),
        ('boolean', 'Boolean'),
        ('select', 'Select'),
    ]
    
    content_type = models.ForeignKey(
        ContentType, 
        on_delete=models.CASCADE,
        related_name='fields'
    )
    field_name = models.CharField(
        max_length=100,
        validators=[
            RegexValidator(
                regex='^[a-z][a-z0-9_]*$',
                message='Field name must start with lowercase letter and contain only lowercase letters, numbers, and underscores'
            )
        ]
    )
    display_name = models.CharField(max_length=200)
    field_type = models.CharField(
        max_length=50,
        choices=FIELD_TYPE_CHOICES
    )
    is_required = models.BooleanField(default=False)
    default_value = models.CharField(max_length=500, blank=True, null=True)
    help_text = models.CharField(max_length=500, blank=True)
    
    # For select fields
    choices = models.JSONField(
        blank=True, 
        null=True,
        help_text='For select fields: ["option1", "option2", "option3"]'
    )
    
    # Field ordering
    order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'id']
        unique_together = ['content_type', 'field_name']
        verbose_name = 'Content Type Field'
        verbose_name_plural = 'Content Type Fields'
    
    def __str__(self):
        return f"{self.content_type.name}.{self.field_name} ({self.field_type})"
