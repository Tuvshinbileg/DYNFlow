from .models import ContentType
from typing import Dict, TypedDict
from logging import getLogger

logger = getLogger(__name__)


class NcTable(TypedDict):
    id: int
    title: str
    table_name: str
    enabled: bool
    meta: Dict[str, object]
    columns: Dict[str, object]


def nocodb_tables_sync(nocodb_tables: [NcTable]) -> bool:
    def map_content_type(entry_nc: NcTable):
        return ContentType(name=entry_nc.get("table_name"), display_name=entry_nc.get("title"))

    try:
        # Get all existing content type names
        existing_names = set(ContentType.objects.values_list('name', flat=True))
        
        # Filter out models that already exist
        models = [
            map_content_type(el) for el in nocodb_tables 
            if el.get("table_name") not in existing_names
        ]
        
        if models:
            ContentType.objects.bulk_create(models)
            logger.info(f"Created {len(models)} new content types")
        else:
            logger.info("No new content types to create")
        
        return True
    except Exception as e:
        logger.error(f"Error syncing content types: {e}")
    return False
