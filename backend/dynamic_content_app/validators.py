"""
Validators for dynamic content based on content type schema
"""
from content_types_app.models import ContentType
from rest_framework.exceptions import ValidationError


def validate_dynamic_content(content_type_name, data):
    """
    Validate submitted data against a content type schema
    """
    try:
        content_type = ContentType.objects.get(
            name=content_type_name, is_active=True)
    except ContentType.DoesNotExist:
        raise ValidationError(
            f"Content type '{content_type_name}' not found or not active")

    errors = {}
    validated_data = {}

    # Get all fields for this content type
    fields = content_type.fields.all()

    for field in fields:
        field_name = field.field_name
        field_value = data.get(field_name)

        # Check required fields
        if field.is_required and (field_value is None or field_value == ''):
            errors[field_name] = f"{field.display_name} is required"
            continue

        # Skip validation for optional empty fields
        if field_value is None or field_value == '':
            if field.default_value:
                validated_data[field_name] = field.default_value
            continue

        # Type-specific validation
        try:
            if field.field_type == 'number':
                validated_data[field_name] = float(field_value)

            elif field.field_type == 'boolean':
                if isinstance(field_value, bool):
                    validated_data[field_name] = field_value
                elif isinstance(field_value, str):
                    validated_data[field_name] = field_value.lower() in [
                        'true', '1', 'yes']
                else:
                    validated_data[field_name] = bool(field_value)

            elif field.field_type == 'email':
                # Basic email validation
                if '@' not in str(field_value):
                    errors[field_name] = f"{field.display_name} must be a valid email"
                else:
                    validated_data[field_name] = str(field_value)

            elif field.field_type == 'select':
                choices = [x['value'] for x in field.choices]

                if field.choices and field_value not in choices:
                    errors[
                        field_name] = f"{field.display_name} must be one of: {', '.join(field.choices)}"
                else:
                    validated_data[field_name] = field_value

            else:  # text, textarea, date
                validated_data[field_name] = str(field_value)

        except (ValueError, TypeError) as e:
            errors[field_name] = f"Invalid value for {field.display_name}: {str(e)}"

    if errors:
        raise ValidationError(errors)

    return validated_data
