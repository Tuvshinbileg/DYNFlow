from dynamic_form_project.settings import (NOCODB_TOKEN, NOCODB_URL, NOCODB_BASE)

import requests


def get_nocodb_tables():
    response = requests.get(f"{NOCODB_URL}/api/v2/meta/bases/{NOCODB_BASE}/tables", headers={"xc-token": NOCODB_TOKEN})

    if response.status_code != 200:
        data = response.json()
        print(data)

        return data
