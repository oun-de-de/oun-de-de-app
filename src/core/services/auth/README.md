# Auth Service Integration

## Overview

Auth service đã được integrate vào project sử dụng `auth-service` package. Service này cung cấp:

- ✅ Centralized authentication management
- ✅ Multiple auth providers (Email, Phone, OAuth - extensible)
- ✅ Automatic token refresh
- ✅ Local storage persistence
- ✅ RxJS streams for real-time auth state
- ✅ Type-safe with full TypeScript support
- ✅ Singleton pattern via service locator

## Architecture

```
src/core/auth/
├── models/
│   └── app-auth-account.ts      # Custom auth account with app-specific user data
├── adapters/
│   └── local-storage-adapter.ts # Bridge to LocalStorageService
├── providers/
│   ├── email-auth-provider.ts   # Email authentication
│   └── provider-manager.ts      # Provider registry
├── mappers/
│   └── account-mapper.ts        # DTO → Account mapping
├── hooks/
│   └── use-auth.ts              # React hooks for auth
├── app-auth-service.ts          # Main auth service implementation
└── index.ts                     # Public exports
```

## Quick Start

### 1. Basic Usage with Hooks

```tsx
import { useSignIn, useSignOut, useAuthUser, useIsAuthenticated } from "@/core/auth";

function LoginForm() {
  const signIn = useSignIn();
  const signOut = useSignOut();
  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = async () => {
    await signIn("username", "password");
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.username}!</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <button onClick={handleLogin}>Sign In</button>
      )}
    </div>
  );
}
```

### 2. Direct Service Access

```tsx
import { getAuthService } from "@/core/auth";

// Get singleton instance
const authService = getAuthService();

// Login
await authService.login(new EmailCredential("email", "user@example.com", "password"));

// Get current user
const user = authService.getCurrentUser();

// Get access token
const token = authService.getAccessToken();

// Logout
await authService.logout();
```

### 3. Subscribe to Auth State Changes

```tsx
import { getAuthService } from "@/core/auth";

const authService = getAuthService();

// Subscribe to all state changes
authService.authStateChanges.subscribe((account) => {
  console.log("Auth state:", account?.isAuthenticated);
});

// Subscribe to authenticated states only
authService.authenticatedStream.subscribe((account) => {
  console.log("User logged in:", account.username);
});

// Subscribe to unauthenticated states
authService.unauthenticatedStream.subscribe(() => {
  console.log("User logged out");
});
```

## Available Hooks

| Hook | Description | Return Type |
|------|-------------|-------------|
| `useAuthService()` | Get auth service instance | `AppAuthService` |
| `useAuthUser()` | Get current user (reactive) | `AppAuthAccount \| null` |
| `useIsAuthenticated()` | Check if authenticated | `boolean` |
| `useSignIn()` | Sign in function | `(username, password) => Promise<Account>` |
| `useSignOut()` | Sign out function | `() => Promise<void>` |
| `useUserInfo()` | Get user data | `AppUserData \| null` |
| `useAccessToken()` | Get access token | `string \| null` |
| `useUserPermissions()` | Get user permissions | `string[]` |
| `useUserRoles()` | Get user roles | `string[]` |
| `useHasPermission(perm)` | Check permission | `boolean` |
| `useHasRole(role)` | Check role | `boolean` |

## User Account Features

The `AppAuthAccount` class provides:

```tsx
const user = useAuthUser();

// Basic info
user?.userId
user?.username
user?.email
user?.phoneNumber
user?.avatar

// Permissions & Roles
user?.roles
user?.permissions
user?.hasRole("admin")
user?.hasPermission("create:user")
user?.hasAnyRole(["admin", "moderator"])
user?.hasAnyPermission(["read:user", "write:user"])

// Auth state
user?.isAuthenticated
user?.authStatus
user?.authToken
user?.refreshToken
```

## API Integration

Auth service tự động integrate với API client:

```tsx
// src/core/auth/providers/email-auth-provider.ts
export class AppEmailAuthProvider extends EmailAuthProvider {
  async login(credential: EmailAuthCredential): Promise<AuthLoginDTO> {
    const response = await apiClient.post({
      url: UserApi.SignIn,
      data: {
        username: credential.email,
        password: credential.password,
      },
    });

    return new AuthLoginDTO({
      credential,
      data: {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      },
    });
  }
}
```

## Local Storage

Auth state tự động được persist:

- **Key**: `app:auth_account`
- **Storage**: `localStorage` (via `LocalStorageService`)
- **Auto-restore**: Session được restore khi app khởi động

## Token Management

Auth service tự động handle:

- ✅ Access token storage
- ✅ Refresh token storage
- ✅ Auto token refresh (coming soon)
- ✅ Token expiration (coming soon)

## Migration from Old userStore

### Before (Old Pattern)

```tsx
import { useUserInfo, useUserToken, useSignIn } from "@/core/store/userStore";

function MyComponent() {
  const userInfo = useUserInfo();
  const userToken = useUserToken();
  const signIn = useSignIn();

  // Usage
  await signIn({ username: "user", password: "pass" });
}
```

### After (New Pattern)

```tsx
import { useUserInfo, useAccessToken, useSignIn } from "@/core/auth";

function MyComponent() {
  const userInfo = useUserInfo();
  const accessToken = useAccessToken();
  const signIn = useSignIn();

  // Usage
  await signIn("user", "pass");
}
```

## Adding New Auth Providers

### 1. Create Provider

```tsx
// src/core/auth/providers/google-auth-provider.ts
import { AuthProvider, AuthLoginDTO } from "auth-service";

export class GoogleAuthProvider extends AuthProvider {
  constructor() {
    super("google");
  }

  async login(credential: GoogleAuthCredential): Promise<AuthLoginDTO> {
    // Call Google OAuth API
    const response = await googleOAuth(credential);

    return new AuthLoginDTO({
      credential,
      data: response,
    });
  }
}
```

### 2. Register Provider

```tsx
// src/core/auth/providers/provider-manager.ts
export class AppAuthProviderManager implements AuthProviderManagerPlatform {
  constructor() {
    this.registerProvider("email", new AppEmailAuthProvider());
    this.registerProvider("phone", new AppPhoneAuthProvider());
    this.registerProvider("google", new GoogleAuthProvider()); // ← Add here
  }
}
```

### 3. Use Provider

```tsx
import { getAuthService, GoogleCredential } from "@/core/auth";

const authService = getAuthService();
const credential = new GoogleCredential("google", "id_token_from_google");
await authService.login(credential);
```

## Example Page

Xem [auth-example.tsx](../pages/sys/auth-example.tsx) để demo đầy đủ các tính năng.

## Troubleshooting

### Service not initialized

```tsx
// Make sure Repository.initialize() is called in main.tsx
Repository.initialize();
const authService = getAuthService();
await authService.initialize();
```

### Token not persisting

```tsx
// Check localStorage
console.log(LocalStorageService.loadOrNull("auth_account"));

// Check service configuration
const authService = getAuthService();
console.log(authService.getCurrentUser());
```

### Type errors with auth-service

```tsx
// Make sure auth-service is properly installed
pnpm install

// Check package.json
"auth-service": "file:./auth-service"
```

## Next Steps

- [ ] Add phone authentication provider
- [ ] Add OAuth providers (Google, Facebook, etc.)
- [ ] Implement automatic token refresh
- [ ] Add token expiration checks
- [ ] Add biometric authentication
- [ ] Add 2FA support
