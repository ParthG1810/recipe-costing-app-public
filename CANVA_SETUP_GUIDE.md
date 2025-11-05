# Canva Integration Setup Guide

This guide explains how Canva integration works in the Weekly Menu Creation feature and what you need to set up.

---

## 🎯 Good News: No API Keys Needed!

The current implementation uses **Canva MCP (Model Context Protocol)** which is already configured and working. You **don't need to get Canva API keys** to use the basic functionality.

---

## 🔧 Two Integration Methods

### Method 1: Canva MCP (Current - Recommended) ✅

**What it is:**
- Uses Manus's built-in Canva MCP integration
- Already authenticated and ready to use
- No API keys required
- Works out of the box

**What you can do:**
- ✅ Generate AI templates with prompts
- ✅ Create designs from candidates
- ✅ Export designs to PNG/PDF/JPG
- ✅ Get design details
- ✅ List available templates

**How to use:**
- Just leave `CANVA_API_KEY` and `CANVA_API_SECRET` empty in `.env`
- The backend will use MCP integration automatically
- Everything works through the `manus-mcp-cli` utility

**Limitations:**
- Only works in Manus environment (sandbox)
- Designs are associated with Manus's Canva account
- Cannot be used in production deployment

---

### Method 2: Canva REST API (For Production) 🚀

**What it is:**
- Direct integration with Canva's official API
- Requires your own Canva Developer account
- Needs API credentials
- Works in production

**What you can do:**
- ✅ Everything Method 1 can do
- ✅ Use your own Canva account
- ✅ Deploy to production
- ✅ Customize branding
- ✅ Access your own templates

**How to get API keys:**
See the detailed guide below.

---

## 📋 Current Setup (No Action Needed)

Your `.env` file should have:

```bash
# Canva Configuration (Optional - leave empty for MCP)
CANVA_API_KEY=
CANVA_API_SECRET=
```

**With these empty, the app uses Canva MCP integration automatically.**

---

## 🚀 How to Get Canva API Keys (For Production)

If you want to deploy to production or use your own Canva account, follow these steps:

### Step 1: Create Canva Developer Account

1. Go to https://www.canva.dev
2. Click "Get Started" or "Sign Up"
3. Sign in with your Canva account (or create one)
4. Complete the developer registration

### Step 2: Create an App

1. Once logged in, go to "My Apps"
2. Click "Create an App"
3. Fill in the details:
   - **App Name:** Recipe Costing - Weekly Menu
   - **App Description:** Tiffin service weekly menu creation with AI templates
   - **App Type:** Web Application
   - **Redirect URL:** http://localhost:3000/api/canva/callback (for development)

4. Click "Create App"

### Step 3: Get Your Credentials

1. After creating the app, you'll see:
   - **Client ID** (this is your `CANVA_API_KEY`)
   - **Client Secret** (this is your `CANVA_API_SECRET`)

2. Copy these values

3. Update your `.env` file:
   ```bash
   CANVA_API_KEY=your_client_id_here
   CANVA_API_SECRET=your_client_secret_here
   ```

### Step 4: Enable Required Scopes

In your Canva app settings, enable these scopes:
- `design:content:read` - Read design content
- `design:content:write` - Create and edit designs
- `design:meta:read` - Read design metadata
- `asset:read` - Read assets
- `asset:write` - Upload assets
- `folder:read` - Read folders
- `folder:write` - Create folders

### Step 5: Set Up OAuth (For Production)

For production deployment, you'll need to set up OAuth:

1. Add production redirect URL in Canva app settings:
   ```
   https://yourdomain.com/api/canva/callback
   ```

2. Implement OAuth flow in your backend:
   - User clicks "Connect Canva"
   - Redirect to Canva authorization URL
   - User authorizes the app
   - Canva redirects back with authorization code
   - Exchange code for access token
   - Store token in database

### Step 6: Update Backend Code

The backend is already set up to use either MCP or REST API. Just add your credentials to `.env` and restart the server.

---

## 🔄 Switching Between MCP and REST API

### Using MCP (Current Setup)

```bash
# .env file
CANVA_API_KEY=
CANVA_API_SECRET=
```

**Backend automatically uses:**
- `manus-mcp-cli` commands
- Canva MCP integration
- No authentication needed

### Using REST API

```bash
# .env file
CANVA_API_KEY=your_client_id
CANVA_API_SECRET=your_client_secret
```

**Backend automatically uses:**
- Canva REST API
- Your own Canva account
- OAuth authentication

---

## 📊 Comparison

| Feature | Canva MCP | Canva REST API |
|---------|-----------|----------------|
| **Setup** | ✅ No setup needed | ⚠️ Requires API keys |
| **Authentication** | ✅ Pre-configured | ⚠️ OAuth required |
| **Development** | ✅ Perfect | ✅ Works |
| **Production** | ❌ Not available | ✅ Required |
| **Cost** | ✅ Free | ✅ Free (with limits) |
| **Your Canva Account** | ❌ Uses Manus account | ✅ Uses your account |
| **Custom Templates** | ❌ Limited | ✅ Full access |
| **Branding** | ❌ Generic | ✅ Your branding |

---

## 💡 Recommendations

### For Development (Current)
✅ **Use Canva MCP** (no setup needed)
- Leave API keys empty
- Everything works out of the box
- Perfect for testing and development

### For Production Deployment
✅ **Get Canva API Keys**
- Follow the steps above
- Set up your own Canva developer account
- Configure OAuth
- Update `.env` with your credentials

---

## 🧪 Testing Current Setup

You can test the Canva integration right now without any API keys:

### Test 1: Generate AI Template

```bash
# In the application:
1. Go to http://localhost:3000/weekly-menu/templates
2. Click "Generate with AI"
3. Select a style (Modern, Traditional, etc.)
4. Wait 10 seconds
5. See 4 AI-generated templates

# This works because it uses Canva MCP!
```

### Test 2: Export Menu

```bash
# In the application:
1. Go to http://localhost:3000/weekly-menu/finalize
2. Select "Surti Fusion Weekly Menu"
3. Choose PNG format
4. Click "Export Menu"
5. Download the exported image

# This also uses Canva MCP!
```

---

## 🔐 Security Notes

### For Development
- MCP integration is secure
- No credentials needed
- Designs are temporary

### For Production
- **Never commit API keys to Git**
- Use environment variables
- Store tokens securely in database
- Use HTTPS for OAuth callbacks
- Implement token refresh logic
- Add rate limiting

---

## 📝 Example .env Configurations

### Development (Current - MCP)
```bash
# No Canva keys needed
CANVA_API_KEY=
CANVA_API_SECRET=
```

### Production (REST API)
```bash
# Your Canva developer credentials
CANVA_API_KEY=AQEBQXXXXXXXXXXXXXXXXXXXXXXXXXx
CANVA_API_SECRET=AQEBQYYYYYYYYYYYYYYYYYYYYYYYYYY

# OAuth settings
CANVA_REDIRECT_URI=https://yourdomain.com/api/canva/callback
CANVA_OAUTH_STATE_SECRET=your_random_secret_here
```

---

## 🚀 Migration Path

When you're ready to deploy to production:

### Phase 1: Development (Now)
- ✅ Use Canva MCP
- ✅ Test all features
- ✅ Build and refine UI
- ✅ No API keys needed

### Phase 2: Pre-Production
- 📝 Create Canva developer account
- 📝 Get API credentials
- 📝 Test with REST API locally
- 📝 Implement OAuth flow

### Phase 3: Production
- 🚀 Add credentials to production `.env`
- 🚀 Configure OAuth callbacks
- 🚀 Deploy to production
- 🚀 Test end-to-end

---

## ❓ FAQ

### Q: Do I need a Canva Pro account?
**A:** No, Canva's free tier works fine. However, some AI features require Canva Pro.

### Q: Can I use the MCP integration in production?
**A:** No, MCP is only available in the Manus sandbox environment. For production, you need REST API.

### Q: How much does Canva API cost?
**A:** Canva API is free with rate limits. Check https://www.canva.dev/docs/api/pricing for details.

### Q: Can I use my existing Canva templates?
**A:** Yes, with REST API integration, you can access all your Canva templates.

### Q: What if I don't want to use Canva?
**A:** You can disable Canva features and just use the menu builder and manual export functionality.

---

## 🎯 Summary

### For Now (Development)
**✅ You're all set!** No action needed. The Canva MCP integration is already working.

### For Later (Production)
**📝 Follow the steps above** to get your own Canva API keys when you're ready to deploy.

---

## 📚 Resources

- **Canva Developers:** https://www.canva.dev
- **API Documentation:** https://www.canva.dev/docs/api
- **OAuth Guide:** https://www.canva.dev/docs/api/authentication
- **Rate Limits:** https://www.canva.dev/docs/api/rate-limits
- **Support:** https://www.canva.dev/support

---

**Questions?** The current setup works perfectly for development. You only need API keys when deploying to production! 🚀
