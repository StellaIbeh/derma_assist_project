# Environment Setup

This app requires environment variables to be configured for the Gemini API integration.

## Setup Instructions

### 1. Create Environment File

Create a `.env` file in the root directory of the project:

```bash
# Gemini API Configuration
# Get your API key from Google AI Studio: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and paste it in your `.env` file

### 3. Restart the Development Server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## Security Notes

- The `.env` file is automatically ignored by git to keep your API key secure
- Never commit your actual API key to version control
- For production deployments, set the environment variable in your hosting platform's configuration

## Troubleshooting

If you see "Configuration Required" in the chat screen:

1. Make sure your `.env` file exists in the root directory
2. Verify the API key is correctly set in the `.env` file
3. Restart the development server
4. Check that the API key is valid by testing it in Google AI Studio 