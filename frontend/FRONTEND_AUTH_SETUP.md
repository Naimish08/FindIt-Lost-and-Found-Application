# Frontend Authentication Setup

The frontend has been integrated with the backend Supabase authentication.

## What's Been Set Up

### 1. API Service (`frontend/services/api.ts`)
- Centralized API client for all backend communication
- Automatic token management with AsyncStorage
- All API calls include authentication headers automatically
- Methods for auth, items, claims, and notifications

### 2. Authentication Context (`frontend/context/AuthContext.tsx`)
- Global authentication state management
- Provides login, register, logout functions
- Automatically checks authentication status on app start
- Persists authentication across app restarts

### 3. Updated Components

#### LoginForm (`frontend/components/LoginForm.tsx`)
- Now uses AuthContext for login
- Shows loading state during authentication
- Displays error messages
- Automatically redirects to protected area on success

#### RegisterForm (`frontend/components/RegisterForm.tsx`)
- Uses AuthContext for registration
- Shows loading state
- Automatically logs in after successful registration
- Redirects to protected area

### 4. Root Layout (`frontend/app/_layout.tsx`)
- Wraps entire app with AuthProvider
- Provides authentication context to all screens

### 5. Index Page (`frontend/app/index.tsx`)
- Entry point that checks auth status
- Redirects to login or protected area automatically
- Shows loading spinner during auth check

### 6. Updated PrimaryButton (`frontend/components/common/PrimaryButton.tsx`)
- Added disabled state support
- Visual feedback when loading

## Environment Setup

Create a `.env` file in the frontend directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
```

**For physical device or emulator:**
- Android Emulator: `http://10.0.2.2:5000`
- iOS Simulator: `http://localhost:5000`
- Physical device: Use your computer's IP (e.g., `http://192.168.1.100:5000`)

## How It Works

### Registration Flow
1. User enters username, email, password
2. Frontend calls `/api/users/register` via authAPI
3. Backend creates user in Supabase Auth
4. Frontend automatically logs in and gets access token
5. Token is stored in AsyncStorage
6. User is redirected to protected area

### Login Flow
1. User enters email and password
2. Frontend calls `/api/users/login` via authAPI
3. Backend authenticates with Supabase
4. Frontend receives access token
5. Token is stored in AsyncStorage
6. User is redirected to protected area

### Protected Routes
- All API calls automatically include the stored token
- If token is invalid/expired, user is logged out
- Auth status persists across app restarts

## API Usage Examples

### Using Auth Context
```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Access user data
  console.log(user?.email);
  
  // Logout
  const handleLogout = async () => {
    await logout();
  };
}
```

### Making API Calls
```typescript
import { itemsAPI, claimsAPI } from '../services/api';

// Get all items
const items = await itemsAPI.getAll();

// Create a lost item post
await itemsAPI.create(description, location, images);

// Submit a claim
await claimsAPI.submit(postID, claimDetails);
```

## Authentication State

The AuthContext provides:
- `user`: Current user object (null if not logged in)
- `loading`: Boolean indicating if auth is being checked
- `isAuthenticated`: Boolean indicating if user is logged in
- `login(email, password)`: Login function
- `register(username, email, password)`: Registration function
- `logout()`: Logout function

## Token Management

- Tokens are automatically stored in AsyncStorage
- Tokens are automatically included in all API requests
- Token is removed on logout
- Token persists across app restarts

## Security Notes

- Tokens are stored securely in AsyncStorage
- Backend validates tokens on each request
- Invalid tokens are automatically rejected
- User is logged out if token is invalid

## Testing

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Test registration:
   - Open the app
   - Go to Register
   - Enter details and submit
   - Should redirect to protected area

4. Test login:
   - Logout (if logged in)
   - Go to Login
   - Enter credentials
   - Should redirect to protected area

5. Test persistence:
   - Login
   - Close and reopen the app
   - Should still be logged in

## Next Steps

- Add password reset functionality
- Add email verification
- Add profile editing
- Add profile picture upload
- Add error handling for network issues
