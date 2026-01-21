# Architecture Guide

## Overview

The Auth Service follows a clean architecture pattern with clear separation of concerns. This guide explains the architectural decisions and how to extend the library.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│         (Your app - React, Vue, Angular, etc.)              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Implementation Layer                        │
│         (Example Auth Service, Custom Services)             │
│  - ExampleAuthService                                       │
│  - ExampleAuthAccount                                       │
│  - ExampleLocalStorage                                      │
│  - Example Providers                                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Core Layer                              │
│              (Abstract classes & interfaces)                │
│  - AuthService<T>                                           │
│  - AuthProvider                                             │
│  - AuthAccount                                              │
│  - AuthToken                                                │
│  - Interfaces & Contracts                                   │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. AuthService (Abstract)

The main service class that orchestrates authentication.

**Responsibilities:**
- Manage authentication state
- Handle login/logout operations
- Token refresh logic
- State notifications via RxJS

**Key Methods:**
```typescript
abstract class AuthService<T extends AuthAccount> {
  abstract providerManager: AuthProviderManagerPlatform;
  abstract accountMapper: AuthAccountMapper<T>;
  
  async initialize(): Promise<void>
  async login(credential: AuthCredential): Promise<T | null>
  async logout(): Promise<void>
  async refreshAccessToken(): Promise<T | null>
  getCurrentUser(): T | null
}
```

### 2. AuthProvider (Abstract)

Base class for all authentication providers.

**Responsibilities:**
- Handle specific authentication method (email, phone, OAuth, etc.)
- Communicate with authentication APIs
- Return standardized DTOs

**Key Methods:**
```typescript
abstract class AuthProvider {
  abstract login(credential: AuthCredential): Promise<AuthLoginDTO>
  abstract loginWithAuthToken(token: AuthToken): Promise<AuthLoginDTO>
}
```

### 3. AuthAccount

Represents an authenticated user account.

**Properties:**
```typescript
class AuthAccount<T> {
  authStatus: AuthenticationStatus
  accountStatus: AccountStatus | null
  providerId: string | null
  identity: string | null
  accessToken: AuthToken | null
  refreshToken: RefreshToken | null
  data: AuthAccountData<T> | null
}
```

### 4. AuthToken

Interface for all token types (JWT, Basic, Refresh).

**Properties:**
```typescript
interface AuthToken {
  type: string
  value: string
  authorizationValue: string
  expiration: Date | null
  isValid: boolean
}
```

## Design Patterns

### 1. Template Method Pattern

`AuthService` uses the template method pattern. The core authentication flow is defined in the base class, while specific implementations override abstract methods.

```typescript
// Base class defines the flow
abstract class AuthService<T> {
  async login(credential: AuthCredential): Promise<T | null> {
    // 1. Authenticate (template method)
    const account = await this.authenticate(credential, {...});
    // 2. Save
    // 3. Notify
    return account;
  }
  
  // Subclasses provide specific implementations
  protected abstract get accountMapper(): AuthAccountMapper<T>;
}
```

### 2. Strategy Pattern

`AuthProvider` implements the strategy pattern, allowing different authentication strategies to be swapped.

```typescript
// Different strategies
class EmailAuthProvider extends AuthProvider {...}
class PhoneAuthProvider extends AuthProvider {...}
class OAuthProvider extends AuthProvider {...}

// Context uses strategies
class AuthService {
  async login(credential: AuthCredential) {
    const provider = this.providerManager.getProvider(credential.providerId);
    return provider.login(credential);
  }
}
```

### 3. Observer Pattern

RxJS Subjects/Observables implement the observer pattern for state management.

```typescript
class AuthService {
  private authStateSubject = new BehaviorSubject<T | null>(null);
  
  get authStateChanges(): Observable<T | null> {
    return this.authStateSubject.asObservable();
  }
}

// Observers subscribe
authService.authStateChanges.subscribe(account => {
  // React to changes
});
```

### 4. Factory Pattern

Token creation uses factory methods.

```typescript
class JWTToken {
  static fromValue(value: string): JWTToken {
    // Parse and create token
  }
}

class BasicAuthToken {
  static fromCredentials(username: string, password: string): BasicAuthToken {
    // Encode and create token
  }
}
```

## Extension Points

### 1. Custom Authentication Service

Create a service for your specific needs:

```typescript
class MyAuthService extends AuthService<MyAuthAccount> {
  protected get providerManager() {
    return new AuthProviderManager({
      providers: [
        new MyEmailProvider({ providerId: 'email' }),
        new MyOAuthProvider({ providerId: 'google' }),
      ],
    });
  }
  
  protected get accountMapper() {
    return {
      fromLogin: (dto, provider, credential) => {
        // Map your specific data structure
        return new MyAuthAccount(...);
      },
    };
  }
  
  // Add custom methods
  async loginWithBiometric() {
    // Custom authentication logic
  }
}
```

### 2. Custom Provider

Implement new authentication methods:

```typescript
class BiometricAuthProvider extends AuthProvider {
  constructor(config: BiometricConfig) {
    super({ providerId: 'biometric' });
  }
  
  async login(credential: BiometricCredential): Promise<AuthLoginDTO> {
    // 1. Capture biometric data
    // 2. Verify with server
    // 3. Return DTO
  }
  
  async loginWithAuthToken(token: AuthToken): Promise<AuthLoginDTO> {
    // Token verification logic
  }
}
```

### 3. Custom Token Type

Create specialized token implementations:

```typescript
class APIKeyToken implements AuthToken {
  type = 'APIKey';
  
  constructor(public value: string) {}
  
  get authorizationValue(): string {
    return `APIKey ${this.value}`;
  }
  
  get expiration(): Date | null {
    return null; // API keys don't expire
  }
  
  get isValid(): boolean {
    return !!this.value;
  }
}
```

### 4. Custom Local Storage

Implement storage for different platforms:

```typescript
// React Native with SecureStore
class SecureAuthStorage implements AuthLocalStoragePlatform<MyAuthAccount> {
  async saveLocalAuthentication(account: MyAuthAccount): Promise<void> {
    await SecureStore.setItemAsync('auth', JSON.stringify(account));
  }
  
  async loadLocalAuthentication(): Promise<MyAuthAccount | null> {
    const data = await SecureStore.getItemAsync('auth');
    return data ? JSON.parse(data) : null;
  }
  
  async clearLocalAuthentication(): Promise<void> {
    await SecureStore.deleteItemAsync('auth');
  }
}

// IndexedDB for web apps
class IndexedDBStorage implements AuthLocalStoragePlatform<MyAuthAccount> {
  // Implementation using IndexedDB
}
```

## State Management Flow

```
┌──────────────┐
│   User       │
│   Action     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│  AuthService.login()         │
│  - Validate credential       │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Provider.login()            │
│  - Call authentication API   │
│  - Return AuthLoginDTO       │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  AccountMapper.fromLogin()   │
│  - Map DTO to AuthAccount    │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  updateCurrentUser()         │
│  - Update internal state     │
│  - Save to local storage     │
│  - Notify observers          │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  authStateSubject.next()     │
│  - Emit new state            │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Observers receive update    │
│  - UI components re-render   │
│  - Side effects trigger      │
└──────────────────────────────┘
```

## Token Refresh Flow

```
┌──────────────────────────────┐
│  Access token expired?       │
└──────┬───────────────────────┘
       │ Yes
       ▼
┌──────────────────────────────┐
│  Check refresh token valid   │
└──────┬───────────────────────┘
       │ Yes
       ▼
┌──────────────────────────────┐
│  Call refreshAccessToken()   │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Provider.loginWithAuthToken │
│  (with refresh token)        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Receive new tokens          │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Update account with new     │
│  access token                │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Save and notify             │
└──────────────────────────────┘

If refresh fails ──────────────┐
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Logout user         │
                    └──────────────────────┘
```

## Best Practices

### 1. Separation of Concerns

- **Core Layer**: Define contracts and base behavior
- **Implementation Layer**: Implement specific authentication logic
- **Application Layer**: Use the service, don't modify it

### 2. Dependency Injection

Inject dependencies through constructor:

```typescript
class MyAuthService extends AuthService<MyAuthAccount> {
  constructor(
    private apiClient: ApiClient,
    private storage: StorageService,
    private config: AuthConfig
  ) {
    super();
  }
}
```

### 3. Error Handling

Use specific exception types:

```typescript
try {
  await authService.login(credential);
} catch (error) {
  if (error instanceof UnsupportedAuthProviderException) {
    // Handle provider not found
  } else if (error instanceof AuthenticationFailedException) {
    // Handle authentication failure
  }
}
```

### 4. Type Safety

Leverage TypeScript generics:

```typescript
// Strongly typed user data
interface MyUserData {
  id: string;
  email: string;
  roles: string[];
}

class MyAuthAccount extends AuthAccount<MyUserData> {
  get roles(): string[] {
    return this.data?.data.roles ?? [];
  }
}

// Service is now type-safe
class MyAuthService extends AuthService<MyAuthAccount> {
  // currentUser is typed as MyAuthAccount
}
```

### 5. Testing

Mock implementations for testing:

```typescript
class MockAuthProvider extends AuthProvider {
  async login(credential: AuthCredential): Promise<AuthLoginDTO> {
    return new AuthLoginDTO({
      credential,
      data: { /* mock data */ },
    });
  }
}

class MockLocalStorage implements AuthLocalStoragePlatform<MyAuthAccount> {
  private storage = new Map();
  // Implement methods with in-memory storage
}
```

## Security Considerations

1. **Token Storage**: Use secure storage (SecureStore, Keychain) for sensitive tokens
2. **Token Expiration**: Always check token validity before use
3. **HTTPS Only**: Ensure all API calls use HTTPS
4. **Refresh Token Rotation**: Implement refresh token rotation on the backend
5. **Logout on Token Refresh Failure**: Automatically logout users when refresh fails

## Performance Optimization

1. **Lazy Loading**: Load providers only when needed
2. **Token Caching**: Cache valid tokens to avoid unnecessary API calls
3. **Debounce State Updates**: Batch state updates to reduce re-renders
4. **Memory Management**: Always call `dispose()` when service is no longer needed

```typescript
useEffect(() => {
  const service = new AuthService(...);
  service.initialize();
  
  return () => {
    service.dispose(); // Clean up subscriptions
  };
}, []);
```

## Future Enhancements

Potential areas for extension:

1. **Multi-factor Authentication**: Add MFA support
2. **Biometric Authentication**: Fingerprint, Face ID
3. **Social Login**: Facebook, Twitter, GitHub
4. **Session Management**: Multiple concurrent sessions
5. **Device Management**: Track and manage logged-in devices
6. **Token Introspection**: Validate tokens with server
7. **Offline Support**: Queue authentication requests when offline
