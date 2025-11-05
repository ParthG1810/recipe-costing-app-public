## Production Deployment Guide: Canva Integration

This guide provides step-by-step instructions for deploying the Recipe Costing application with the production-ready Canva REST API integration.

### Table of Contents
1.  [Overview](#overview)
2.  [Prerequisites](#prerequisites)
3.  [Step 1: Get Canva API Credentials](#step-1-get-canva-api-credentials)
4.  [Step 2: Configure Environment Variables](#step-2-configure-environment-variables)
5.  [Step 3: Deploy the Application](#step-3-deploy-the-application)
6.  [Step 4: Test Production Integration](#step-4-test-production-integration)
7.  [Troubleshooting](#troubleshooting)

---

### Overview

The application supports two modes for Canva integration:

*   **MCP (Model Context Protocol):** Default for development. Works out of the box without any API keys.
*   **REST API:** For production. Requires Canva API credentials and provides more control.

This guide focuses on setting up the **REST API** for your production environment.

### Prerequisites

*   A Canva account
*   A production server (e.g., AWS, Vercel, Heroku)
*   The application code deployed to your server

---

### Step 1: Get Canva API Credentials

**1.1. Set Up Multi-Factor Authentication (MFA)**

Canva requires MFA to be enabled before you can create an integration. This is a mandatory security step.

1.  Log in to your Canva account.
2.  Go to **Account Settings** > **Security**.
3.  Enable **Multi-Factor Authentication** and follow the on-screen instructions (usually with an authenticator app like Google Authenticator or Authy).

**1.2. Create a Canva Integration**

1.  Go to the [Canva Developer Portal](https://www.canva.com/developers/integrations/connect-api).
2.  Click **Create an integration**.
3.  Fill in the integration details:
    *   **Integration Name:** `Recipe Costing - Weekly Menu`
    *   **Description:** `Tiffin service weekly menu creation with AI templates`
4.  Click **Create integration**.

**1.3. Get Your Credentials**

After creating the integration, you will see your **Client ID** and **Client Secret**. These are your API credentials.

*   **Client ID** → This is your `CANVA_API_KEY`
*   **Client Secret** → This is your `CANVA_API_SECRET`

Copy these values and keep them safe.

**1.4. Configure Redirect URLs**

In your integration settings, add the following redirect URL:

*   **Redirect URL:** `https://your-production-domain.com/api/canva/auth/callback`

Replace `https://your-production-domain.com` with your actual production domain.

**1.5. Enable Required Scopes**

In your integration settings, under the **Scopes** section, enable the following permissions:

*   `design:content:read`
*   `design:content:write`
*   `design:meta:read`
*   `asset:read`
*   `asset:write`
*   `folder:read`
*   `folder:write`

---

### Step 2: Configure Environment Variables

In your production environment, create a `.env` file or use your hosting provider's environment variable settings.

```bash
# .env (Production)

# Database Configuration
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=recipe_costing_db

# Server Configuration
PORT=8080
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://your-production-domain.com

# Canva REST API Configuration
CANVA_ENABLED=true
CANVA_API_KEY=paste_your_client_id_here
CANVA_API_SECRET=paste_your_client_secret_here
CANVA_REDIRECT_URI=https://your-production-domain.com/api/canva/auth/callback

# Other configurations...
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=https://your-production-domain.com
```

**Key Changes:**

*   Update database credentials.
*   Set `NODE_ENV` to `production`.
*   Update `FRONTEND_URL` and `CORS_ORIGIN` to your domain.
*   **Add your `CANVA_API_KEY` and `CANVA_API_SECRET`.**
*   Update `CANVA_REDIRECT_URI` to your domain.

---

### Step 3: Deploy the Application

Deploy your application to your production server using your preferred method (e.g., `git push`, Docker, etc.).

Make sure to:

1.  Install dependencies: `npm install --production`
2.  Build the frontend: `npm run build`
3.  Start the server: `npm start` (or `node server/index.js`)

---

### Step 4: Test Production Integration

1.  Open your application at `https://your-production-domain.com`.
2.  Go to the **Templates** page.
3.  You should see a **"Connect Canva"** button.
4.  Click the button to initiate the OAuth flow.
5.  You will be redirected to Canva to authorize the application.
6.  After authorizing, you will be redirected back to your application.
7.  Now, try generating a template with AI. It will use your Canva account and the REST API.

---

### Troubleshooting

*   **"Canva API credentials not configured"**: Make sure `CANVA_API_KEY` and `CANVA_API_SECRET` are set in your environment variables.
*   **"Redirect URI mismatch"**: Ensure the `CANVA_REDIRECT_URI` in your `.env` file matches the one in your Canva integration settings.
*   **OAuth errors**: Check that you have enabled all the required scopes in your Canva integration settings.
*   **500 errors**: Check your server logs for detailed error messages.

---

By following this guide, you can seamlessly switch from the development MCP integration to the production REST API integration. The application code is already built to handle both modes automatically based on the presence of Canva API credentials in your environment.
