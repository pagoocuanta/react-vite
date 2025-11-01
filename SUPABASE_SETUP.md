# 🚀 Supabase Integration Guide for Gruppy

## Step 1: Connect Supabase MCP Integration

1. **[Open MCP popover](#open-mcp-popover)** in Builder.io
2. Connect to **Supabase** integration
3. This gives you direct access to database management and authentication

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Choose a region close to your users
4. Wait for the project to be ready (~2 minutes)

## Step 3: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `database/supabase-schema.sql`
3. Paste it into the SQL Editor and run it
4. This creates all necessary tables, indexes, and sample data

## Step 4: Get Your Supabase Credentials

1. In Supabase dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** 
   - **anon public key**
   - **service_role secret key** (for server-side operations)

## Step 5: Configure Environment Variables

Add these to your environment variables (use DevServerControl tool):

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 6: Install Supabase Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 7: Update Your Server Routes

Replace your current mock routes with Supabase routes:

```typescript
// In server/index.ts, replace:
import { getTasks, createTask, updateTask, updateTaskStatus, updateSubtask, deleteTask } from "./routes/tasks";

// With:
import { getTasks, createTask, updateTask, updateTaskStatus, updateSubtask, deleteTask } from "./routes/tasks-supabase";
```

## Step 8: Test Your Integration

1. Restart your development server
2. Your app should now use real Supabase data
3. All CRUD operations will persist to the database
4. Drag & drop task updates will be saved

## 🔒 Security Configuration

### Row Level Security (RLS)

The schema includes basic RLS policies. Customize these based on your needs:

```sql
-- Example: Only allow users to see their own tasks
CREATE POLICY "Users can view own tasks" ON public.tasks 
FOR SELECT USING (assignee_id = auth.uid());
```

### Authentication Setup

1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Configure your authentication providers
3. Set up email templates
4. Configure redirect URLs

## 🚀 Advanced Features

### Real-time Subscriptions

Add real-time updates to your tasks:

```typescript
// In your React components
useEffect(() => {
  const subscription = supabase
    .channel('tasks')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'tasks' 
    }, (payload) => {
      // Update your local state
      console.log('Task updated:', payload);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

### File Storage

For images and attachments:

1. In Supabase dashboard, go to **Storage**
2. Create buckets for user avatars, post images, etc.
3. Configure upload policies

## 📊 Data Migration

To migrate existing mock data:

1. The schema includes sample data insertion
2. Modify the INSERT statements to match your current data
3. Update user IDs to match your authentication system

## 🔧 Troubleshooting

### Common Issues:

1. **Environment variables not loaded**: Use DevServerControl to set them
2. **RLS policies blocking queries**: Temporarily disable RLS during development
3. **Foreign key constraints**: Ensure user IDs exist before creating related records

### Database Backup:

```sql
-- Export your data
SELECT * FROM public.tasks;
SELECT * FROM public.users;
-- etc.
```

## 🎯 Next Steps

1. **Authentication**: Implement Supabase Auth in your frontend
2. **Real-time**: Add subscriptions for live updates
3. **File Upload**: Integrate Supabase Storage for images
4. **Edge Functions**: Add server-side logic with Supabase Edge Functions

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

Your Gruppy app is now ready for production with a scalable, real-time database! 🎉
