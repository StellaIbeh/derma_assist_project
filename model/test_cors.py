import requests
import json

def test_cors():
    """Test CORS configuration"""
    url = "https://dermassist-app-qxzs.onrender.com/"
    
    # Test OPTIONS request (preflight)
    print("Testing CORS preflight request...")
    try:
        response = requests.options(url)
        print(f"OPTIONS Status: {response.status_code}")
        print(f"CORS Headers: {dict(response.headers)}")
        
        # Check for CORS headers
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers',
            'Access-Control-Allow-Credentials'
        ]
        
        for header in cors_headers:
            if header in response.headers:
                print(f"✅ {header}: {response.headers[header]}")
            else:
                print(f"❌ {header}: Not found")
                
    except Exception as e:
        print(f"❌ Error testing CORS: {e}")
    
    # Test actual GET request
    print("\nTesting actual GET request...")
    try:
        response = requests.get(url)
        print(f"GET Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Error testing GET: {e}")

if __name__ == "__main__":
    test_cors() 