# Deployment Guide: Task Board Application

## Prerequisites

- Supabase account
- Deployment platform account (Vercel, Netlify, or similar)
- Git repository

## Step 1: Database Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: task-board-production
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
4. Wait for project provisioning (~2 minutes)

### 1.2 Run Database Migration

1. Navigate to SQL Editor in Supabase Dashboard
2. Copy the entire contents of `migrations/001_create_tasks_table.sql`
3. Paste into SQL Editor
4. Click "Run" to execute migration
5. Verify tables created: Go to Table Editor → tasks table should exist

### 1.3 Enable Real-time

In SQL Editor, run:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
```

### 1.4 Configure Authentication

1. Go to Authentication → Providers
2. Enable "Email" provider
3. Configure settings:
   - For development: Disable email confirmations
   - For production: Enable email confirmations (recommended)
4. Optional: Configure email templates (Settings → Auth → Email Templates)

### 1.5 Get API Credentials

1. Go to Settings → API
2. Copy:
   - Project URL (`https://xxxxx.supabase.co`)
   - Anon/Public key (starts with `eyJ...`)
3. Save these for deployment configuration

## Step 2: Frontend Deployment (Vercel)

### 2.1 Prepare Repository

```bash
# Ensure code is committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your Git repository
4. Configure build settings:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
6. Click "Deploy"

### 2.3 Verify Deployment

1. Wait for build to complete
2. Visit the provided URL (e.g., `your-app.vercel.app`)
3. Test:
   - Sign up with email/password
   - Create a task
   - Drag task between columns
   - Check real-time sync in multiple tabs

## Alternative: Deploy to Netlify

### Option 1: Netlify CLI

```bash
cd frontend

# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

When prompted:
- Build command: `npm run build`
- Publish directory: `dist`
- Add environment variables in Netlify dashboard

### Option 2: Netlify UI

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect Git repository
4. Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. Add environment variables in Site settings → Environment variables
6. Deploy

## Step 3: Post-Deployment Configuration

### 3.1 Update CORS (if needed)

If deploying to custom domain, update Supabase CORS:
1. Settings → API → Allowed Origins
2. Add your production URL

### 3.2 Configure Rate Limiting

For production, consider:
- Supabase rate limiting (automatic on paid plans)
- CDN caching for static assets
- Connection pooling (automatic with Supabase)

### 3.3 Set up Monitoring

Recommended tools:
- **Error tracking**: Sentry (frontend errors)
- **Performance**: Lighthouse CI (automated audits)
- **Uptime**: UptimeRobot or Pingdom
- **Analytics**: Supabase Dashboard Analytics

### 3.4 Enable Security Features

1. **RLS Verification**: Ensure Row Level Security is enabled
2. **Auth Settings**:
   - Enable JWT secret rotation (Settings → Auth)
   - Configure session timeout
   - Enable MFA (if available)
3. **Database**:
   - Verify backups are enabled (automatic on Supabase)
   - Review database connection limits

## Step 4: Performance Optimization

### 4.1 Enable Caching

Add cache headers in `vercel.json` or `netlify.toml`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 4.2 Enable Compression

Both Vercel and Netlify automatically compress assets, but verify:
- Brotli compression enabled
- Gzip fallback available

### 4.3 CDN Configuration

- Vercel/Netlify automatically use CDN
- Verify assets are served from edge locations
- Check response headers for `x-vercel-cache` or similar

## Step 5: Monitoring & Maintenance

### 5.1 Set Up Alerts

**Supabase**:
- Database size approaching limit
- Connection pool exhaustion
- Unusual query patterns

**Vercel/Netlify**:
- Build failures
- Deployment errors
- High error rates

### 5.2 Regular Tasks

**Weekly**:
- Check error logs in Sentry/Dashboard
- Review performance metrics
- Monitor database size

**Monthly**:
- Update dependencies (security patches)
- Review and rotate API keys if needed
- Check backup status

**Quarterly**:
- Performance audit with Lighthouse
- Security audit
- Review and optimize database queries

## Troubleshooting

### Build Fails

**Issue**: "Module not found" errors
**Solution**: 
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Loading

**Issue**: App shows "Missing Supabase credentials"
**Solution**:
- Verify environment variables in deployment platform
- Ensure variables start with `VITE_`
- Redeploy after adding variables

### Real-time Not Working

**Issue**: Changes in one tab don't appear in others
**Solution**:
- Verify real-time is enabled: `ALTER PUBLICATION supabase_realtime ADD TABLE tasks;`
- Check browser console for WebSocket errors
- Verify Supabase project is not paused

### CORS Errors

**Issue**: API requests blocked by CORS
**Solution**:
- Add production domain to Supabase allowed origins
- Check CORS headers in network tab

## Rollback Procedure

If deployment fails or has issues:

### Vercel
```bash
# List deployments
vercel ls

# Roll back to previous deployment
vercel rollback [deployment-url]
```

### Netlify
1. Go to Deploys in Netlify dashboard
2. Find last working deployment
3. Click "Publish deploy"

## Cost Estimates

### Free Tier (MVP)
- Supabase: Free (up to 500MB database, 2GB bandwidth)
- Vercel/Netlify: Free (100GB bandwidth)
- Total: $0/month

### Production Tier
- Supabase Pro: $25/month (8GB database, 50GB bandwidth)
- Vercel Pro: $20/month (1TB bandwidth)
- Sentry Team: $26/month (error tracking)
- Total: ~$71/month

## Security Checklist

- [X] RLS policies enabled on tasks table
- [ ] Email confirmations enabled (production)
- [ ] JWT secret rotated
- [ ] HTTPS enforced (automatic on Vercel/Netlify)
- [ ] Environment variables secured
- [ ] Database backups enabled
- [ ] Rate limiting configured
- [ ] CORS origins restricted to production domains
- [ ] API keys rotated regularly
- [ ] Security headers configured

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html
