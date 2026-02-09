# Backend API Integration Guide

## Overview
The React Native app is now fully integrated with your backend API running at `http://localhost:3000/api`.

## What Was Implemented

### 1. **API Client** (`services/api.ts`)
- Axios-based HTTP client with automatic JWT token management
- Interceptors for authentication and error handling
- Methods for all backend endpoints (auth, services, bookings)

### 2. **Type Definitions** (`types/api.ts`)
- TypeScript interfaces for User, Service, Booking
- Request/Response types for all API operations

### 3. **Authentication Context** (`contexts/auth-context.tsx`)
- Global auth state management using React Context
- Automatic token persistence with AsyncStorage
- Login, register, logout, and profile refresh functions

### 4. **Updated Screens**

#### **Login/Register** (`app/modal.tsx`)
- Switch between login and register modes
- Form validation
- Error handling with user feedback

#### **Browse Services** (`app/(tabs)/index.tsx`)
- Fetches services from GET /api/services
- Displays only active services
- Loading and error states
- Dynamic pricing and duration formatting

#### **Bookings List** (`app/(tabs)/bookings.tsx`)
- Fetches user bookings from GET /api/bookings
- Shows booking status with color coding
- Cancel booking functionality (DELETE /api/bookings/:id)
- Authentication check with login prompt

#### **Profile** (`app/(tabs)/profile.tsx`)
- Displays authenticated user information
- Shows initials avatar
- Logout functionality
- Login prompt for guests

#### **Book Service** (`app/book-cleaner.tsx`)
- Fetches available services
- Date/time selection
- Address and special instructions
- Creates booking via POST /api/bookings
- Form validation

## How to Use

### 1. **Start Your Backend**
Make sure your backend is running on `http://localhost:3000/api`

### 2. **Start the React Native App**
```bash
# Start Expo
npm run android  # or npm run ios

# Or with offline mode
npx expo start --offline
```

### 3. **Test the Flow**

#### **Register a New User:**
1. Open the app
2. Go to Profile tab → Click "Log In"
3. Switch to "Sign Up" mode
4. Fill in: Full Name, Phone, Email, Password
5. Click "Sign Up"

#### **Log In:**
1. Go to Profile tab → Click "Log In"
2. Enter your email and password
3. Click "Log In"

#### **Browse Services:**
1. Go to Browse tab (home)
2. Services are loaded from backend automatically
3. Click "Book →" on any service

#### **Create a Booking:**
1. Select a service
2. Enter date (format: YYYY-MM-DD, e.g., 2026-02-15)
3. Select time slot
4. Enter your address
5. Add special instructions (optional)
6. Click "Create Booking"

#### **View Bookings:**
1. Go to Bookings tab
2. See all your bookings with status
3. Cancel upcoming bookings if needed

#### **View Profile:**
1. Go to Profile tab
2. See your user information
3. Log out if needed

## API Configuration

### **Change Backend URL**
Edit `services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
// Change to your production URL when deploying:
// const API_BASE_URL = 'https://your-api.com/api';
```

### **Token Storage**
- Tokens are stored in AsyncStorage with key: `auth_token`
- Automatically included in request headers as `Bearer <token>`
- Cleared on logout or 401 errors

## Error Handling

The app handles common errors:
- **Network errors**: Shows "Failed to load..." messages with retry buttons
- **401 Unauthorized**: Automatically clears token and prompts login
- **Validation errors**: Shows alerts with specific error messages
- **Server errors**: Displays user-friendly error messages

## Status Mapping

Booking statuses from API are mapped to UI labels:
- `pending` → "Pending" (orange)
- `confirmed` → "Upcoming" (teal)
- `in_progress` → "In Progress" (teal)
- `completed` → "Completed" (green)
- `cancelled` → "Cancelled" (gray)

## Date/Time Formatting

- **API expects**: Date as `YYYY-MM-DD`, Time as `HH:MM` (24-hour)
- **User sees**: "Today, 2:00 PM" or "Tomorrow, 10:00 AM" or "Dec 15, 3:00 PM"

## Testing Tips

1. **Use real backend data**: No mock data in the app anymore
2. **Check console logs**: Errors are logged to console for debugging
3. **Test authentication**: Try accessing bookings without login
4. **Test booking flow**: Create, view, and cancel bookings
5. **Test error states**: Stop backend to see error handling

## Dependencies Added

```json
{
  "axios": "latest",
  "@react-native-async-storage/async-storage": "latest"
}
```

## File Structure

```
cleaning-app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Browse services (API-powered)
│   │   ├── bookings.tsx       # User bookings (API-powered)
│   │   ├── profile.tsx        # User profile (Auth context)
│   │   └── _layout.tsx        # Tab navigation
│   ├── modal.tsx              # Login/Register screen
│   ├── book-cleaner.tsx       # Create booking (API-powered)
│   └── _layout.tsx            # Root with AuthProvider
├── contexts/
│   └── auth-context.tsx       # Auth state management
├── services/
│   └── api.ts                 # API client
└── types/
    └── api.ts                 # TypeScript types
```

## Next Steps

1. **Add loading states**: Improve UX with skeleton screens
2. **Add date picker**: Use a proper date/time picker component
3. **Add image upload**: For profile pictures or service images
4. **Add push notifications**: For booking updates
5. **Add payment integration**: Connect to payment gateway
6. **Add reviews system**: Let users rate services
7. **Add real-time tracking**: WebSocket for live updates

## Troubleshooting

### Issue: "Failed to load services"
- Check backend is running on http://localhost:3000
- Check network connection (use same WiFi for device and backend)
- Check console for detailed error messages

### Issue: "Login Required"
- User needs to log in first
- Click "Log In" button on profile or any protected action

### Issue: Token expired
- App automatically clears invalid tokens
- User will be prompted to log in again

### Issue: Can't connect to localhost on device
- Use your computer's local IP instead of localhost
- Example: `http://192.168.1.100:3000/api`
- Find your IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

## Support

For issues or questions about the integration, check:
1. Console logs in React Native debugger
2. Network tab in React Native debugger
3. Backend logs for API errors
4. This README for common solutions
