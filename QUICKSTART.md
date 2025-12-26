# Quick Start - Task Board Application

Get the Task Board app running in **under 10 minutes**.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Supabase account (free tier: [supabase.com](https://supabase.com))

## Step 1: Install Dependencies (2 min)

```bash
cd todotoday/frontend
npm install
```

## Step 2: Create Supabase Project (3 min)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name:** task-board-dev
   - **Database Password:** (auto-generate or create strong password)
   - **Region:** (choose closest to you)
4. Click **"Create new project"**
5. ⏳ Wait ~2 minutes for provisioning

## Step 3: Setup Database (2 min)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy **all** contents from:
   ```
   todotoday/migrations/001_create_tasks_table.sql
   ```
4. Paste into SQL Editor
5. Click **"Run"** button
6. ✅ Should see "Success. No rows returned"

## Step 4: Enable Real-time (30 sec)

In the same SQL Editor, run this one-liner:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
```

Click **"Run"**. ✅ Done!

## Step 5: Enable Authentication (1 min)

1. Go to **Authentication → Providers**
2. Find **"Email"** provider
3. Toggle **ON** (should be green)
4. Click **Settings → Auth**
5. Find **"Enable email confirmations"**
6. Toggle **OFF** (for development only!)
7. Click **"Save"**

## Step 6: Get API Credentials (30 sec)

1. Go to **Settings → API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 7: Configure Environment (30 sec)

In `todotoday/frontend/` folder:

```bash
# Copy template
cp .env.local.template .env.local

# Edit .env.local and paste your credentials:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 8: Start App (10 sec)

```bash
npm run dev
```

Open browser to: **http://localhost:5173**

## Step 9: Test It Out! (2 min)

1. **Sign Up:**
   - Enter email: `test@example.com`
   - Enter password: `password123`
   - Click **"Sign Up"**

2. **Create a Task:**
   - Click **"Add Task"** button
   - Title: "My First Task"
   - Description: "Testing the board"
   - Click **"Create"**

3. **Drag It:**
   - Drag the card to "In Progress" column
   - ✅ Status should change automatically

4. **Test Real-time:**
   - Open a second tab to `http://localhost:5173`
   - Sign in with same credentials
   - Create a task in one tab
   - ✅ Should appear in other tab instantly!

## Troubleshooting

### "Module not found" errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### "Missing Supabase credentials"
- Check `.env.local` file exists in `frontend/` folder
- Verify variables start with `VITE_`
- Restart dev server after editing `.env.local`

### Tasks not loading
- Check browser console (F12) for errors
- Verify database migration ran successfully
- Check Supabase project is not paused (free tier)

### Real-time not working
- Verify you ran: `ALTER PUBLICATION supabase_realtime ADD TABLE tasks;`
- Check network tab for WebSocket connection
- Try refreshing the page

### Drag-and-drop not working
- Make sure you're on desktop (touch needs 250ms hold)
- Try dragging from the card body (not buttons)
- Check console for errors

## What You Get

✅ **Full-featured Kanban board:**
- Create, edit, delete tasks
- Drag-and-drop between columns
- Real-time sync across tabs
- Offline detection
- 100-task limit
- Mobile responsive

## Next Steps

- **Read the code:** Start with `src/components/Board.jsx`
- **Run tests:** `npm test` (note: limited tests implemented)
- **Try offline mode:** Turn off WiFi, see the banner
- **Check docs:** See `README.md` and `IMPLEMENTATION_SUMMARY.md`

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests (requires dev server running)
npm run test:e2e
```

## Common Development Tasks

### Add a new component
```bash
# Create file
touch src/components/MyComponent.jsx

# Create test
touch tests/unit/MyComponent.test.jsx
```

### Debug Supabase queries
```javascript
// In browser console:
const { data, error } = await supabase
  .from('tasks')
  .select('*')
console.log({ data, error })
```

### Check real-time connection
```javascript
// In browser console:
supabase.channel('test')
  .on('system', {}, (status) => console.log(status))
  .subscribe()
```

## Project Structure Quick Reference

```
frontend/
├── src/
│   ├── components/     ← React components
│   ├── hooks/          ← Custom hooks
│   ├── services/       ← API services
│   ├── utils/          ← Helper functions
│   ├── App.jsx         ← Root component
│   └── main.jsx        ← Entry point
├── tests/              ← Test files
├── .env.local          ← Your credentials (gitignored)
└── package.json        ← Dependencies
```

## Need Help?

- 📖 **Full README:** `README.md`
- 🚀 **Deployment:** `DEPLOYMENT.md`
- 📊 **Status:** `IMPLEMENTATION_SUMMARY.md`
- 🏗️ **Architecture:** `specs/001-task-board/plan.md`
- 📝 **Tasks:** `specs/001-task-board/tasks.md`

---

**Total Time:** ~10 minutes
**Difficulty:** Easy
**Result:** Fully functional task board! 🎉
