# Local Development Notes

## Canva Integration Modes

The application supports **three modes** for Canva integration:

### 1. Mock Mode (Local Development) 🏠

**When:** Running on your local machine without Canva API keys  
**How it works:** Uses placeholder templates and images  
**Perfect for:** Testing the UI and workflow without Canva setup

**Features:**
- ✅ Returns 4 sample templates (Modern, Traditional, Colorful, Minimalist)
- ✅ Generates placeholder export images
- ✅ No setup required
- ✅ Instant responses (no API calls)
- ❌ Not real Canva designs

**To use:** Just leave `.env` as is:
```bash
CANVA_ENABLED=true
CANVA_API_KEY=
CANVA_API_SECRET=
```

### 2. MCP Mode (Manus Sandbox) ☁️

**When:** Running in Manus sandbox environment  
**How it works:** Uses `manus-mcp-cli` commands  
**Perfect for:** Development in Manus environment

**Features:**
- ✅ Real Canva AI generation
- ✅ No API keys needed
- ✅ Works automatically in sandbox
- ❌ Only available in Manus environment

### 3. REST API Mode (Production) 🚀

**When:** Deployed to production with Canva API credentials  
**How it works:** Uses Canva REST API with OAuth  
**Perfect for:** Production deployment

**Features:**
- ✅ Real Canva integration
- ✅ User-specific Canva accounts
- ✅ Full Canva features
- ⚙️ Requires API setup

**To use:** Add credentials to `.env`:
```bash
CANVA_ENABLED=true
CANVA_API_KEY=your_client_id
CANVA_API_SECRET=your_client_secret
CANVA_REDIRECT_URI=https://your-domain.com/api/canva/auth/callback
```

---

## How the App Detects the Mode

The application automatically detects which mode to use:

1. **Checks if `manus-mcp-cli` is available**
   - If yes → Can use MCP mode
   - If no → Cannot use MCP mode

2. **Checks if API keys are provided**
   - If yes → Use REST API mode
   - If no and MCP available → Use MCP mode
   - If no and MCP not available → Use MOCK mode

**You don't need to do anything!** The app figures it out automatically.

---

## Testing on Your Local Machine

### What Works in Mock Mode

✅ **Recipe Images Page**
- Upload images
- View gallery
- Set default images

✅ **Menu Builder Page**
- Create weekly menus
- Add/remove items
- Edit menu details

✅ **Templates Page**
- Generate AI templates (returns 4 mock templates)
- View template gallery
- Save templates to library

✅ **Export & Share Page**
- Export menus (returns placeholder images)
- Generate share links
- Copy to clipboard

### What's Different in Mock Mode

📋 **Templates:**
- Shows 4 placeholder templates instead of real Canva designs
- Template thumbnails are placeholder images
- Still fully functional for testing the workflow

📋 **Exports:**
- Returns placeholder images instead of real Canva exports
- Still downloadable and shareable
- Perfect for testing the export flow

---

## Upgrading from Mock to Real Canva

When you're ready to use real Canva integration:

### Option 1: Get Canva API Keys (Recommended)

1. Follow `PRODUCTION_DEPLOYMENT_GUIDE.md`
2. Set up MFA on Canva
3. Create integration
4. Add credentials to `.env`
5. Restart server

**Result:** Real Canva integration on your local machine!

### Option 2: Deploy to Manus Sandbox

1. Use Manus to run your code
2. MCP mode activates automatically
3. Real Canva integration works

**Result:** Real Canva integration in sandbox!

---

## Checking Current Mode

### Via API:
```bash
curl http://localhost:3001/api/canva/auth/status
```

### Response Examples:

**Mock Mode (Your current mode):**
```json
{
  "success": true,
  "data": {
    "mode": "MOCK",
    "message": "Using Mock Canva service (local development mode)",
    "note": "Mock mode provides sample templates for testing. Add Canva API keys for real integration."
  }
}
```

**MCP Mode (Sandbox):**
```json
{
  "success": true,
  "data": {
    "mode": "MCP",
    "message": "Using Canva MCP integration (sandbox mode)",
    "note": null
  }
}
```

**REST Mode (Production):**
```json
{
  "success": true,
  "data": {
    "mode": "REST",
    "message": "Using Canva REST API (production mode)",
    "note": null
  }
}
```

---

## Mock Templates

The mock service provides 4 sample templates:

1. **Modern Weekly Menu** (Blue theme)
2. **Traditional Weekly Menu** (Orange theme)
3. **Colorful Weekly Menu** (Teal theme)
4. **Minimalist Weekly Menu** (Pink theme)

Each template:
- Has a unique ID
- Shows a placeholder thumbnail
- Can be "saved" to your library
- Can be "exported" as an image

---

## Benefits of Mock Mode

### For Development:
- ✅ No external dependencies
- ✅ Fast response times
- ✅ No API rate limits
- ✅ No setup required
- ✅ Works offline

### For Testing:
- ✅ Test complete workflow
- ✅ Verify UI/UX
- ✅ Check database operations
- ✅ Test export functionality
- ✅ Validate share links

### For Demos:
- ✅ Show features without Canva account
- ✅ Consistent results
- ✅ No API costs
- ✅ Instant responses

---

## Troubleshooting

### "No templates showing"
**Solution:** The app is in MOCK mode. You should see 4 placeholder templates. If not, check browser console for errors.

### "Export returns placeholder image"
**Expected:** This is normal in MOCK mode. Upgrade to REST API mode for real exports.

### "Want real Canva integration"
**Solution:** Follow `PRODUCTION_DEPLOYMENT_GUIDE.md` to get API keys and switch to REST mode.

---

## Summary

**Current Setup:** MOCK mode (perfect for local development)  
**What Works:** Everything! (with placeholder templates)  
**What's Next:** Test all features, then upgrade to REST API when ready

**No action needed!** The app works great in MOCK mode for development and testing. 🎉
