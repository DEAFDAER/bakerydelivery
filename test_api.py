#!/usr/bin/env python3
"""
Test script to verify the API endpoints are working
"""
import urllib.request
import urllib.parse
import json

def test_api_endpoint(url, description):
    """Test an API endpoint and return the result"""
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print(f"✅ {description}")
            print(f"   Status: {response.status}")
            print(f"   Response: {len(data) if isinstance(data, list) else 'Object'}")
            if isinstance(data, list) and len(data) > 0:
                print(f"   Sample item: {data[0].get('name', data[0].get('id', 'N/A'))}")
            return True
    except Exception as e:
        print(f"❌ {description}")
        print(f"   Error: {e}")
        return False

def main():
    """Test all API endpoints"""
    print("Testing Bongao Bakery API endpoints...\n")
    
    base_url = "http://localhost:8000"
    
    endpoints = [
        ("/", "Root endpoint"),
        ("/health", "Health check"),
        ("/api/categories/", "Categories endpoint"),
        ("/api/products/", "Products endpoint"),
        ("/api/products/?search=bread", "Products with search filter"),
        ("/api/products/?category_id=1", "Products with category filter"),
        ("/api/products/?in_stock=true", "Products with stock filter"),
    ]
    
    success_count = 0
    total_count = len(endpoints)
    
    for endpoint, description in endpoints:
        url = base_url + endpoint
        if test_api_endpoint(url, description):
            success_count += 1
        print()
    
    print(f"Results: {success_count}/{total_count} endpoints working")
    
    if success_count == total_count:
        print("🎉 All endpoints are working correctly!")
    else:
        print("⚠️  Some endpoints have issues")

if __name__ == "__main__":
    main()

