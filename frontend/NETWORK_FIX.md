# Network Connection Fix

## Problem
The frontend was unable to connect to the backend API, showing "Network request failed" error.

## Root Cause
The API URL was pointing to `localhost:5000`, which doesn't work on Android emulators. Android emulators cannot access `localhost` of the host machine.

## Solution
Created a `.env` file in the frontend directory with the correct Android emulator URL:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000
```

## Why `10.0.2.2`?
- Android emulators use a special IP address (`10.0.2.2`) to refer to the host machine's `localhost`
- `10.0.2.2` is automatically mapped to `127.0.0.1` (localhost) on the host machine
- This allows the emulator to connect to services running on your computer

## Important Steps

### 1. Make sure the backend is running
```bash
cd backend
npm run dev
```
The backend should be running on `http://localhost:5000`

### 2. Restart the Expo dev server
**IMPORTANT:** After creating/modifying the `.env` file, you must restart the Expo dev server for changes to take effect.

1. Stop the current Expo server (Ctrl+C)
2. Start it again:
```bash
cd frontend
npm start
```

### 3. Clear the app cache (if needed)
If the app is still using the old URL:
- Press `r` in the Expo terminal to reload
- Or shake the device and tap "Reload"

## Testing

1. Backend should be running on port 5000
2. Frontend should connect to `http://10.0.2.2:5000`
3. Try registering a new user
4. Should successfully create account and login

## For iOS Simulator
If you're using iOS Simulator instead, you can use:
```env
EXPO_PUBLIC_API_URL=http://localhost:5000
```
iOS Simulator can access `localhost` directly.

## For Physical Device
For testing on a physical device on the same network:
1. Find your computer's IP address (e.g., `192.168.1.100`)
2. Use that IP in the .env file:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

## Current Setup
- **Environment:** Android Emulator
- **API URL:** `http://10.0.2.2:5000`
- **Backend:** Running on `http://localhost:5000`
- **Status:** Ready to connect
