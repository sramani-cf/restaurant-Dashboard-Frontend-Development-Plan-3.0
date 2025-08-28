# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth for the Restaurant Dashboard application.

## Step 1: Access Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Select an existing project or create a new one

## Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**
4. Also enable "People API" (recommended for profile access)

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - **App name**: `AURA 2030 Restaurant Dashboard`
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload your restaurant logo
   - **App domain**: Leave blank for development
   - **Developer contact information**: Your email address
4. Click **Save and Continue**
5. Skip the **Scopes** section for now (click **Save and Continue**)
6. Add test users (your email addresses that you want to test with)
7. Click **Save and Continue**

## Step 4: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Choose **Web application** as the application type
4. Set the name: `AURA 2030 Web Client`
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (Frontend development)
   - `http://localhost:8000` (Backend development)
6. Add **Authorized redirect URIs**:
   - `http://localhost:8000/api/v1/auth/google/callback`
   - `http://localhost:3000/auth/oauth/success`
7. Click **Create**

## Step 5: Save Your Credentials

After creating the OAuth client, you'll see a modal with:
- **Client ID**: Looks like `123456789-abcdefgh.apps.googleusercontent.com`
- **Client Secret**: A random string like `GOCSPX-abcdefgh123456789`

**Important**: Copy these values immediately and store them securely.

## Step 6: Update Environment Variables

1. Open `Backend/.env` file
2. Replace the placeholder values with your actual credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:8000/api/v1/auth/google/callback
```

## Step 7: Create Frontend Environment File

1. Create `Frontend/.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Step 8: Testing the Setup

1. Start your backend server:
   ```bash
   cd Backend
   npm run dev
   ```

2. Start your frontend server:
   ```bash
   cd Frontend
   npm run dev
   ```

3. Navigate to `http://localhost:3000/auth/login`
4. Click the **Google** button
5. You should be redirected to Google's OAuth consent screen

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Make sure your redirect URIs in Google Cloud Console exactly match the ones in your app
   - Check for trailing slashes and HTTP vs HTTPS

2. **"This app isn't verified" warning**
   - This is normal for development. Click "Advanced" > "Go to AURA 2030 (unsafe)"
   - In production, you'll need to verify your app with Google

3. **"Access blocked" error**
   - Make sure you've added your email as a test user in the OAuth consent screen
   - Check that all required APIs are enabled

4. **Environment variables not loading**
   - Restart your development servers after updating `.env` files
   - Make sure `.env` files are in the correct directories

## Security Notes

- **Never commit your OAuth credentials to version control**
- Use different OAuth clients for development and production
- In production, use HTTPS for all redirect URIs
- Consider using environment-specific configuration management

## Production Setup

For production deployment:

1. Create a separate OAuth client for production
2. Update redirect URIs to use your production domain with HTTPS
3. Complete the app verification process with Google
4. Update your environment variables in your production environment

## Need Help?

If you encounter issues:
1. Check the Google Cloud Console logs
2. Verify your OAuth client configuration
3. Make sure all APIs are enabled
4. Check your environment variables are correct
5. Restart both frontend and backend servers

The OAuth flow should now work! Users can sign up and log in using their Google accounts, bypassing the email verification process.