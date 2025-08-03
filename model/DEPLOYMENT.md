# Deployment Guide - CORS Configuration

## CORS Issue Resolution

The CORS error occurs because your React Native app (running on localhost:8081) is trying to make requests to your Render-hosted API, but the API doesn't have CORS headers configured.

## ✅ Solution Applied

I've added CORS middleware to your FastAPI application in `main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",  # Expo development server
        "http://localhost:8082",  # Alternative Expo port
        "http://localhost:3000",  # Common React development port
        "http://localhost:19006", # Expo web
        "https://dermassist-app-qxzs.onrender.com",  # Your Render domain
        "*"  # Allow all origins for development (remove in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🚀 Deployment Steps

### 1. Update Your Render Deployment

1. **Push the changes to your repository:**
   ```bash
   git add .
   git commit -m "Add CORS middleware to fix cross-origin requests"
   git push origin main
   ```

2. **Render will automatically redeploy** your application with the new CORS configuration.

### 2. Verify the Deployment

1. **Check your Render dashboard** to ensure the deployment completed successfully.

2. **Test the CORS configuration:**
   ```bash
   cd model
   python test_cors.py
   ```

3. **Test from your React Native app** - the CORS error should now be resolved.

## 🔧 Alternative Solutions

If you continue to have issues, here are alternative approaches:

### Option 1: Use a CORS Proxy (Development Only)
```javascript
// In your React Native app, use a CORS proxy
const response = await fetch('https://cors-anywhere.herokuapp.com/https://dermassist-app-qxzs.onrender.com/predict', {
  method: 'POST',
  body: formData,
});
```

### Option 2: Environment-Specific CORS
```python
# In main.py - more restrictive for production
import os

ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://localhost:8082",
    "https://your-production-domain.com"
]

if os.getenv("ENVIRONMENT") == "development":
    ALLOWED_ORIGINS.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Option 3: Custom Headers
```python
# Add custom headers to your endpoints
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    response = JSONResponse(content=result)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response
```

## 🛡️ Security Considerations

### For Production:
1. **Remove wildcard origins** (`"*"`) and specify exact domains
2. **Limit allowed methods** to only what you need
3. **Restrict allowed headers** to necessary ones
4. **Consider using environment variables** for origins

### Example Production Configuration:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-production-app.com",
        "https://your-mobile-app.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)
```

## 🔍 Troubleshooting

### If CORS still doesn't work:

1. **Check Render logs** for any deployment errors
2. **Verify the API is running** by visiting the health check endpoint
3. **Test with curl** to ensure the API responds correctly
4. **Check browser console** for specific CORS error messages

### Common Issues:
- **Render deployment failed** - Check build logs
- **API not responding** - Verify the service is running
- **Wrong origin** - Ensure your app's origin is in the allowed list

## 📱 Testing from React Native

After deployment, test your app:

1. **Restart your Expo development server**
2. **Try taking a skin scan** - should work without CORS errors
3. **Check the network tab** in browser dev tools for successful requests

## 🎯 Expected Result

After deploying the CORS fix:
- ✅ No more CORS errors in browser console
- ✅ Successful API requests from your React Native app
- ✅ Skin scan functionality working properly
- ✅ Grad-CAM visualization loading correctly 