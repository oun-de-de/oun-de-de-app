# Auth Service - TypeScript

A flexible and extensible authentication service library for TypeScript/JavaScript applications. This library provides a clean architecture for handling multiple authentication providers (Email, Phone, OAuth, etc.).

## Features

- 🔐 Multiple authentication providers support (Email, Phone, OAuth, etc.)
- 🎯 Type-safe with full TypeScript support
- 🔄 Token management (Access token, Refresh token, JWT, Basic Auth)
- 💾 Local storage abstraction for persisting authentication state
- 📡 RxJS streams for authentication state changes
- 🏗️ Clean architecture with separation of concerns
- 🔌 Pluggable provider system
- 🎨 Easy to extend and customize

## Architecture

The library follows a clean architecture pattern with clear separation:

```
auth-service/
├── core/                      # Core abstractions
│   ├── interfaces/           # Interfaces & contracts
│   ├── models/              # Data models
│   ├── providers/           # Authentication providers
│   ├── tokens/              # Token implementations
│   └── exceptions/          # Error handling
└── implementations/         # Concrete implementations
    └── example/            # Example implementation
```

## Installation

```bash
npm install @auth/service
# or
yarn add @auth/service
```

## Quick Start

### 1. Define Your Auth Account Model

```typescript
import { AuthAccount, AuthAccountData } from '@auth/service';

interface MyUserData {
  id: string;
  name: string;
  email: string;
}

class MyAuthAccount extends AuthAccount<MyUserData> {
  // Add custom methods or properties if needed
}
```

### 2. Implement Local Storage

```typescript
import { AuthLocalStoragePlatform } from '@auth/service';

class MyLocalStorage implements AuthLocalStoragePlatform<MyAuthAccount> {
  async saveLocalAuthentication(account: MyAuthAccount): Promise<void> {
    localStorage.setItem('auth', JSON.stringify(account));
  }

  async loadLocalAuthentication(): Promise<MyAuthAccount | null> {
    const data = localStorage.getItem('auth');
    return data ? JSON.parse(data) : null;
  }

  async clearLocalAuthentication(): Promise<void> {
    localStorage.removeItem('auth');
  }
}
```

### 3. Create Authentication Providers

```typescript
import { EmailAuthProvider, EmailAuthCredential } from '@auth/service';

class MyEmailAuthProvider extends EmailAuthProvider {
  async login(credential: EmailAuthCredential): Promise<AuthLoginDTO> {
    // Call your API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credential.email,
        password: credential.password,
      }),
    });
    
    const data = await response.json();
    return new AuthLoginDTO({ credential, data });
  }
}
```

### 4. Create Auth Service

```typescript
import { AuthService, AuthProviderManager } from '@auth/service';

class MyAuthService extends AuthService<MyAuthAccount> {
  protected providerManager = new AuthProviderManager({
    providers: [
      new MyEmailAuthProvider({ providerId: 'email' }),
      // Add more providers
    ],
  });

  protected localStorage = new MyLocalStorage();

  protected accountMapper = {
    fromLogin: (dto, provider, credential) => {
      // Map DTO to your AuthAccount
      return new MyAuthAccount({
        authStatus: 'authenticated',
        providerId: provider.providerId,
        identity: credential?.identity,
        accessToken: dto.data.accessToken,
        refreshToken: dto.data.refreshToken,
        data: new AuthAccountData({ data: dto.data.user }),
      });
    },
  };
}
```

### 5. Use the Auth Service

```typescript
const authService = new MyAuthService();

// Initialize
await authService.initialize();

// Listen to auth state changes
authService.authStateChanges.subscribe((account) => {
  console.log('Auth state changed:', account);
});

// Login
const credential = new EmailAuthCredential({
  providerId: 'email',
  email: 'user@example.com',
  password: 'password123',
});

const user = await authService.login(credential);

// Logout
await authService.logout();
```

## Provider Examples

### Email Authentication

```typescript
const emailCredential = new EmailAuthCredential({
  providerId: 'email',
  email: 'user@example.com',
  password: 'secure-password',
});

await authService.login(emailCredential);
```

### Phone Authentication

```typescript
// Request OTP
const phoneCredential = new PhoneAuthCredential({
  providerId: 'phone',
  phoneNumber: '+1234567890',
});

await authService.requestOtp(phoneCredential);

// Verify OTP
phoneCredential.otp = '123456';
await authService.login(phoneCredential);
```

## API Reference

### AuthService

Main service class for handling authentication.

**Methods:**
- `initialize()`: Initialize the service and restore authentication state
- `login(credential)`: Authenticate user with credentials
- `loginWithAuthToken(token)`: Authenticate with a token
- `logout()`: Logout current user
- `refreshAccessToken()`: Refresh the access token
- `getCurrentUser()`: Get current authenticated user

**Streams:**
- `authStateChanges`: Observable of all auth state changes
- `authenticatedStream`: Observable of authenticated state only
- `unauthenticatedStream`: Observable of unauthenticated state only

### Providers

- `EmailAuthProvider`: Email/password authentication
- `PhoneAuthProvider`: Phone number with OTP authentication
- Custom providers: Extend `AuthProvider` base class

### Tokens

- `JWTToken`: JWT token implementation
- `BasicAuthToken`: Basic authentication token
- `RefreshToken`: Refresh token for obtaining new access tokens

## Advanced Usage

### Custom Provider

```typescript
class OAuthProvider extends AuthProvider {
  constructor(config: { providerId: string; clientId: string }) {
    super({ providerId: config.providerId });
    this.clientId = config.clientId;
  }

  async login(credential: OAuthCredential): Promise<AuthLoginDTO> {
    // Implement OAuth flow
  }
}
```

### Multiple Services

You can create multiple instances of AuthService for different authentication contexts:

```typescript
const adminAuthService = new AdminAuthService();
const userAuthService = new UserAuthService();
```

## Testing

```bash
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines.
