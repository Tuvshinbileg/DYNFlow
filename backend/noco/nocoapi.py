from dynamic_form_project.settings import (NOCODB_TOKEN, NOCODB_URL, NOCODB_BASE)
from logging import getLogger

import requests

logger = getLogger(__name__)


def get_nocodb_tables():
    """Fetch tables from NocoDB"""
    try:
        if not NOCODB_TOKEN or not NOCODB_URL or not NOCODB_BASE:
            error_msg = "Missing NocoDB configuration (NOCODB_TOKEN, NOCODB_URL, or NOCODB_BASE)"
            logger.error(error_msg)
            return {'error': error_msg}
        
        url = f"{NOCODB_URL}/api/v2/meta/bases/{NOCODB_BASE}/tables"
        headers = {"xc-token": NOCODB_TOKEN}
        
        logger.info(f"Fetching NocoDB tables from {url}")
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            error_msg = f"NocoDB API returned status {response.status_code}"
            try:
                data = response.json()
                error_msg = data.get('message', error_msg)
            except:
                error_msg = f"{error_msg}: {response.text}"
            
            logger.error(f"Error fetching NocoDB tables: {error_msg}")
            return {'error': error_msg}
        
        data = response.json()
        logger.info(f"Successfully fetched {len(data.get('list', []))} tables from NocoDB")
        return data
        
    except requests.exceptions.Timeout:
        error_msg = "NocoDB request timed out"
        logger.error(error_msg)
        return {'error': error_msg}
    except requests.exceptions.ConnectionError:
        error_msg = "Failed to connect to NocoDB"
        logger.error(error_msg)
        return {'error': error_msg}
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.error(error_msg)
        return {'error': error_msg}
