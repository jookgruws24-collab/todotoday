# Railway Deployment Guide

## Quick Deploy to Railway (10 minutes)

### Prerequisites
- Railway account (free tier available at [railway.app](https://railway.app))
- GitHub repository with your code
- Supabase project with credentials

---

## Step 1: Prepare Your Repository

### 1.1 Create Railway Configuration

Create `railway.toml` in the **root** directory (already created for you).

### 1.2 Commit and Push

```bash
git add .
git commit -m "Add Railway deployment config"
git push origin main
```

---

## Step 2: Deploy to Railway

### Method 1: Railway Dashboard (Recommended)

1. **Go to [railway.app](https://railway.app) and login**

2. **Click "New Project"**

3. **Select "Deploy from GitHub repo"**
   - Connect your GitHub account if not already connected
   - Select your `todotoday` repository

4. **Configure the deployment**:
   - Railway will auto-detect the project
   - Root directory: `/` (leave as default)
   - Build command will be detected from railway.toml
   - Start command will be detected from railway.toml

5. **Add Environment Variables**:
   Click on your service → Variables → Add variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

6. **Deploy**:
   - Railway will automatically start building
   - Wait 2-3 minutes for the build to complete
   - You'll get a URL like: `https://your-app.up.railway.app`

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to project (if already created on dashboard)
railway link

# Add environment variables
railway variables set VITE_SUPABASE_URL=https://your-project.supabase.co
railway variables set VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Deploy
railway up
```

---

## Step 3: Configure Custom Domain (Optional)

1. Go to your Railway project
2. Click on your service
3. Go to Settings → Domains
4. Click "Generate Domain" for a Railway domain
5. Or click "Custom Domain" to add your own domain

---

## Step 4: Verify Deployment

1. **Open your Railway URL**
2. **Test the following**:
   - Sign up with email/password
   - Create a task
   - Edit a task
   - Drag task between columns
   - Open in another tab → test real-time sync
   - Turn off WiFi → check offline indicator

---

## Configuration Details

### Build Settings (Auto-detected from railway.toml)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Start Command**: `npx serve -s frontend/dist -l $PORT`
- **Install Command**: `npm install -g serve`

### Environment Variables Required
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Port Configuration
- Railway automatically assigns a PORT environment variable
- The app will listen on the assigned port
- No additional configuration needed

---

## Troubleshooting

### Build Fails with "Module not found"

**Solution**:
```bash
# Locally test the build
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

Then commit and push the updated `package-lock.json`.

### "Missing environment variables" error

**Solution**:
1. Go to Railway Dashboard
2. Click your service → Variables
3. Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
4. Redeploy: Settings → Redeploy

### App shows blank page

**Solution**:
1. Check Railway logs: Click on Deployments → View logs
2. Look for build errors
3. Verify the build output directory is `frontend/dist`
4. Check browser console (F12) for errors

### Real-time not working

**Solution**:
1. Verify Supabase real-time is enabled:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
   ```
2. Check browser console for WebSocket errors
3. Verify Supabase project is not paused

### 404 on page refresh

**Solution**: Already handled! The `serve` package with `-s` flag enables SPA mode.

---

## Monitoring & Logs

### View Logs
1. Railway Dashboard → Your Project
2. Click on Deployments
3. Click on latest deployment
4. View logs in real-time

### Metrics
1. Click on your service
2. Go to Metrics tab
3. View CPU, Memory, Network usage

---

## Updating Your App

### Automatic Deployments (Recommended)
Railway automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main
```

Railway will automatically detect the push and redeploy.

### Manual Deployment
```bash
# Using Railway CLI
railway up
```

Or in Railway Dashboard:
- Settings → Redeploy

---

## Cost Estimates

### Railway Pricing
- **Free Tier**: $5 credit/month (hobby plan)
  - Enough for small projects
  - Sleep after inactivity
  
- **Developer Plan**: $5/month
  - No sleep
  - Better performance

- **Team Plan**: $20/month
  - Multiple users
  - Priority support

### Total Monthly Cost (with Supabase)
- Railway (Free): $0
- Supabase (Free): $0
- **Total**: $0/month for MVP

---

## Railway-Specific Features

### Enable Health Checks
1. Go to Settings
2. Enable Health Check
3. Path: `/`
4. Interval: 60 seconds

### Configure Restart Policy
1. Settings → Restart Policy
2. Set to "On Failure"
3. Max restarts: 3

### View Build Output
- Deployments → Build logs
- Check for warnings or errors

---

## Rollback to Previous Version

1. Go to Deployments
2. Find previous working deployment
3. Click "⋮" menu
4. Select "Redeploy"

---

## Security Checklist

- [X] Environment variables stored securely in Railway
- [X] Supabase RLS policies enabled
- [ ] Custom domain with HTTPS (automatic)
- [ ] Enable Railway's built-in DDoS protection
- [ ] Set up monitoring alerts

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: Create issues in your repository

---

## Quick Reference Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# View logs
railway logs

# Open project in browser
railway open

# Add environment variable
railway variables set KEY=value

# Deploy
railway up

# Check status
railway status
```

---

## Next Steps After Deployment

1. ✅ Test all features on production
2. ✅ Share the URL with users
3. ✅ Set up error monitoring (optional: Sentry)
4. ✅ Configure custom domain (optional)
5. ✅ Enable backups for Supabase database
6. ✅ Set up uptime monitoring

---

**Your app will be live at**: `https://your-app.up.railway.app` 🚀
