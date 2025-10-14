import requests
import json

try:
    response = requests.get('http://localhost:8000/api/categories/')
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code == 200:
        categories = response.json()
        print(f"Found {len(categories)} categories")
        for cat in categories:
            print(f"- {cat['name']}: {cat.get('description', 'No description')}")
except Exception as e:
    print(f"Error: {e}")
