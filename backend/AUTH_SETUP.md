# Supabase Authentication Setup

This backend now uses Supabase Auth for user authentication instead of manual password hashing.

## Changes Made

### 1. Authentication Middleware (`backend/middleware/auth.ts`)
- Created `authenticateSupabaseToken` middleware to verify JWT tokens from Supabase
- Created `optionalAuth` middleware for routes that work with or without authentication
- Extends Express Request type to include user information

### 2. Updated Routes
All routes now use authentication middleware where appropriate:

#### User Routes (`backend/routes/user.ts`)
- `POST /api/users/register` - Registers users with Supabase Auth
- `POST /api/users/login` - Authenticates users and returns session token
- `GET /api/users/profile` - Protected route to get user profile

#### Item Routes (`backend/routes/item.ts`)
- `POST /api/items` - Protected: Create lost item posts
- `GET /api/items/search` - Optional auth: Search lost items
- `GET /api/items` - Optional auth: Get all items
- `GET /api/items/:id` - Optional auth: Get specific item

#### Claim Routes (`backend/routes/claim.ts`)
- `POST /api/claims/:postID` - Protected: Submit a claim
- `GET /api/claims/post/:postID` - Protected: Get claims for a post
- `PUT /api/claims/:claimID` - Protected: Update claim status

#### Notification Routes (`backend/routes/notification.ts`)
- `POST /api/notifications` - Protected: Create notification
- `GET /api/notifications` - Protected: Get user's notifications
- `PUT /api/notifications/:id/read` - Protected: Mark notification as read

### 3. Supabase Client (`backend/supabaseClient.ts`)
- Configured multiple client instances:
  - Regular client with anon key
  - Admin client with service role key (bypasses RLS)
  - Helper function to create user-specific clients

## Environment Variables

Create a `.env` file in the backend directory with:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=5000
```

## API Usage

### Registration
```bash
POST /api/users/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Login
```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

# Response includes:
# {
#   "user": { ... },
#   "session": {
#     "access_token": "...",
#     "refresh_token": "..."
#   }
# }
```

### Authenticated Requests
Include the access token in the Authorization header:

```bash
GET /api/users/profile
Authorization: Bearer <access_token>
```

## Frontend Integration

The frontend should:
1. Call `/api/users/login` to get the access token
2. Store the token (e.g., in AsyncStorage or secure storage)
3. Include the token in all authenticated requests: `Authorization: Bearer <token>`
4. Handle token refresh when it expires

## Security Notes

- Passwords are never stored in the database - Supabase handles password hashing
- JWT tokens are used for authentication
- All protected routes verify the token before processing
- The service role key should NEVER be exposed to the frontend

## Removed Dependencies

- `bcrypt` - No longer needed as Supabase handles password hashing
