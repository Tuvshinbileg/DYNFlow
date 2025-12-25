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
        return ContentType(name=entry_nc.get("title"), content_type=entry_nc.get("table_name"))

    try:
        models = [map_content_type(el) for el in nocodb_tables]
        ContentType.objects.bulk_create(models)
        return True
    except Exception as e:
        logger.error(e)
    return False
