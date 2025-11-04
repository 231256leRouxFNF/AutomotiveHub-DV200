# AutoHub Admin Guide

## 🔑 How to Create an Admin Account

### Step 1: List All Users
```bash
cd autohub/backend
node scripts/listUsers.js
```

This will show you all users in the database with their IDs, usernames, and emails.

### Step 2: Make a User an Admin
```bash
node scripts/makeAdmin.js
```

The script will:
1. Show you all users
2. Ask for the user ID you want to make admin
3. Update that user to have admin privileges

### Step 3: Login as Admin
1. Go to your website and login with the admin user's credentials
2. Navigate to `/admin` to access the admin panel

---

## 📋 Admin Panel Features

### 1. **Events Tab**
- View all pending events
- Approve or deny events
- Delete denied events

### 2. **Posts Tab**
- View all posts from all users
- Delete any post
- See post author and creation date

### 3. **Users Tab** ✨ NEW
- View all registered users
- See user ID, username, email, role, and registration date
- Delete any user (except yourself)
- **Warning**: Deleting a user will also delete:
  - All their posts
  - All their vehicles
  - All their events
  - All other associated data

---

## 🗑️ Delete Functionality

### Delete Posts (As Post Owner)
- On the Community Feed, you'll see a red "🗑️ Delete" button on YOUR posts
- Click to delete with confirmation

### Delete Posts (As Admin)
- Go to Admin Panel → Posts Tab
- Click "Delete Post" on any post

### Delete Users (Admin Only)
- Go to Admin Panel → Users Tab
- Click "Delete" next to any user (except yourself)
- Confirm the deletion

### Delete Events (Admin Only)
- Go to Admin Panel → Events Tab
- Click "Deny & Delete" to remove an event

---

## 🚨 Important Notes

1. **Passwords**: User passwords are hashed and cannot be retrieved. If you need to test with existing accounts, you'll need to:
   - Create new test accounts via the registration page
   - OR ask users for their passwords
   - OR manually reset passwords in the database (requires bcrypt hashing)

2. **Admin Protection**: You cannot delete your own admin account through the admin panel

3. **Cascading Deletes**: When you delete a user, all their data is permanently removed

---

## 🛠️ Technical Details

### Backend API Endpoints

**Admin Routes** (require admin role):
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:userId` - Delete a user
- `GET /api/admin/posts` - Get all posts

**Post Routes**:
- `DELETE /api/social/posts/:postId` - Delete a post (owner or admin)

**Event Routes**:
- `DELETE /api/events/:id` - Delete an event (admin only)

### Database Tables Affected
When deleting a user, the following tables are affected (if you have foreign key constraints set up):
- `users` (main table)
- `posts` (user's posts)
- `vehicles` (user's vehicles)
- `events` (user's events)
- `post_likes` (user's likes)
- `comments` (user's comments)

---

## 📞 Support

If you encounter any issues:
1. Check the browser console for frontend errors
2. Check the backend terminal for server errors
3. Verify you're logged in as an admin
4. Ensure your token hasn't expired (try logging out and back in)
