# Environment Setup Guide

## Quick Start

1. **Copy the template:**
   ```bash
   cp .env.example .env
   ```

2. **Get your API keys** (see sections below)

3. **Add keys to `.env` file**

4. **Start the application:**
   ```bash
   npm run dev
   ```

---

## Required API Keys

### 1. OpenRouter API Key (REQUIRED)

**Purpose:** Powers AI component identification and annotated image generation via Gemini

**How to get it:**
1. Visit [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up or log in
3. Click "Create Key"
4. Copy the key (starts with `sk-or-v1-...`)
5. Add to `.env`:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

**Cost:**
- Free tier available
- Gemini 2.0 Flash: ~$0.10 per 1M input tokens
- Pay-as-you-go pricing

**Models available:**
- `google/gemini-2.0-flash-exp:free` (Default - Free)
- `google/gemini-pro-vision` (Better quality, paid)
- `anthropic/claude-3-opus` (Best quality, expensive)

---

### 2. Sketchfab API Key (REQUIRED)

**Purpose:** Search and download 3D models from Sketchfab library

**How to get it:**
1. Visit [https://sketchfab.com](https://sketchfab.com)
2. Create an account or log in
3. Go to Settings → Password → API Tokens
4. Click "Generate Token"
5. Copy the token
6. Add to `.env`:
   ```env
   SKETCHFAB_API_KEY=your-sketchfab-token-here
   ```

**Notes:**
- Free Sketchfab accounts have API access
- Can only download models marked as "Downloadable"
- Rate limits apply (check Sketchfab docs)

---

## Optional API Keys

### 3. OpenAI API Key (OPTIONAL)

**Status:** Not currently used in production code

**Purpose:** Originally planned for GPT-4 mesh explanations (feature removed)

**How to get it:**
1. Visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create account and add payment method
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. Add to `.env`:
   ```env
   OPENAI_API_KEY=sk-your-openai-key-here
   ```

**You can skip this** unless you plan to add GPT-4 features.

---

### 4. Google API Key (OPTIONAL)

**Status:** Not currently used

**Purpose:** Reserved for future geospatial features

**You can skip this** for now.

---

## Configuration Options

### Production Demo Mode

```env
# Disable API calls and use cached annotations
NEXT_PUBLIC_PRODUCTION_DEMO=true

# Enable full AI-powered analysis
NEXT_PUBLIC_PRODUCTION_DEMO=false
```

**Use `true` when:**
- Deploying a public demo
- Want to avoid API costs
- Testing without API keys

**Use `false` when:**
- Developing locally with API access
- Want real-time AI analysis
- Testing the full pipeline

---

### Application URL

```env
# Local development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production deployment
NEXT_PUBLIC_APP_URL=https://mesh.yourdomain.com
```

This is sent as the `HTTP-Referer` header to OpenRouter for usage tracking.

---

## Environment Files Overview

| File | Purpose | Commit to Git? |
|------|---------|----------------|
| `.env` | Your actual secrets | ❌ NO |
| `.env.example` | Template with no values | ✅ YES |
| `.env.local` | Local overrides | ❌ NO |
| `.env.production` | Production-specific vars | ❌ NO |

---

## Vercel Deployment

If deploying to Vercel:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable:
   - `OPENROUTER_API_KEY`
   - `SKETCHFAB_API_KEY`
   - `NEXT_PUBLIC_PRODUCTION_DEMO`
   - `NEXT_PUBLIC_APP_URL`

4. Set environment scope:
   - Production
   - Preview (optional)
   - Development (optional)

---

## Troubleshooting

### "OpenRouter API key not configured"
- Check `.env` file exists in `/Mesh/main/`
- Verify `OPENROUTER_API_KEY` is set
- Restart dev server: `npm run dev`

### "Sketchfab API error"
- Verify API key is valid
- Check if model is downloadable
- Check Sketchfab API rate limits

### "Failed to get AI explanation"
- Check OpenRouter credit balance
- Verify model name is correct
- Check network/firewall settings

### Environment variables not loading
```bash
# Restart the dev server
npm run dev

# Or force reload
rm -rf .next
npm run dev
```

---

## Security Best Practices

1. **Never commit `.env` to Git**
   ```bash
   # Verify .gitignore includes:
   .env
   .env.local
   .env*.local
   ```

2. **Use different keys for dev/prod**
   - Development: Use free tier keys
   - Production: Use separate paid keys with limits

3. **Rotate keys regularly**
   - OpenRouter: Every 90 days
   - Sketchfab: If exposed

4. **Monitor usage**
   - OpenRouter: [https://openrouter.ai/activity](https://openrouter.ai/activity)
   - Sketchfab: Check account usage

---

## Cost Estimates

**Typical usage for development:**
- OpenRouter (Gemini Free): $0/month
- Sketchfab API: Free
- **Total: $0/month**

**Production with heavy usage:**
- 1000 component identifications/month
- Gemini 2.0 Flash: ~$2-5/month
- Sketchfab: Free
- **Total: ~$2-5/month**

---

## Example: Complete `.env` File

```env
# AI Services
OPENROUTER_API_KEY=sk-or-v1-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free

# Model Search
SKETCHFAB_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# App Config
NEXT_PUBLIC_PRODUCTION_DEMO=false
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional (can leave empty)
OPENAI_API_KEY=
GOOGLE_API_KEY=
```

---

## Next Steps

After setting up your `.env`:

1. Test the configuration:
   ```bash
   npm run dev
   ```

2. Try searching for a model:
   - Type "drone" in the search bar
   - Click "Generate"

3. Test AI identification:
   - Click on a model component
   - Click "Identify with AI"
   - Should see annotated image

4. If issues, check the console:
   ```bash
   # Browser console (F12)
   # Terminal logs
   ```

Need help? Check the main README or create an issue on GitHub.
