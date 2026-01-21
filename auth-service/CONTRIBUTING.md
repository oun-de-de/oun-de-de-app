# Contributing to LCS Auth Service

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/lcs/auth-service-ts.git
   cd auth-service-ts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Lint code**
   ```bash
   npm run lint
   ```

## Project Structure

```
typescript-auth-service/
├── src/
│   ├── core/                    # Core abstractions
│   │   ├── auth-service.ts     # Main service class
│   │   ├── interfaces/         # Interfaces & contracts
│   │   ├── models/             # Data models
│   │   ├── providers/          # Provider abstractions
│   │   ├── tokens/             # Token implementations
│   │   └── exceptions/         # Error classes
│   ├── implementations/        # Concrete implementations
│   │   └── lcs/               # LCS-specific implementation
│   └── index.ts               # Main export file
├── examples/                   # Usage examples
├── tests/                      # Test files
└── docs/                       # Documentation
```

## Coding Standards

### TypeScript Style

- Use TypeScript strict mode
- Prefer interfaces for data structures
- Use abstract classes for behavior contracts
- Leverage generics for type safety
- Document public APIs with JSDoc comments

### Example:

```typescript
/**
 * Authenticates user with given credentials
 * @param credential - The authentication credential
 * @returns Promise resolving to authenticated account or null
 * @throws {UnsupportedAuthProviderException} When provider is not found
 */
public async login(credential: AuthCredential): Promise<T | null> {
  // Implementation
}
```

### Naming Conventions

- Classes: `PascalCase` (e.g., `AuthService`)
- Interfaces: `PascalCase` with optional `I` prefix (e.g., `AuthToken` or `IAuthToken`)
- Methods/Functions: `camelCase` (e.g., `getCurrentUser`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_TIMEOUT`)
- Private members: prefix with `_` or use `private` keyword

### Code Organization

- One class per file
- Group related files in directories
- Export from index.ts files
- Keep files under 300 lines

## Testing Guidelines

### Unit Tests

Write tests for:
- Public methods
- Edge cases
- Error conditions
- Token validation
- State transitions

Example:
```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should authenticate user with valid credentials', async () => {
      // Arrange
      const service = new TestAuthService();
      const credential = new EmailAuthCredential('email', 'test@example.com', 'pass');
      
      // Act
      const account = await service.login(credential);
      
      // Assert
      expect(account).not.toBeNull();
      expect(account?.isAuthenticated).toBe(true);
    });
    
    it('should throw exception when provider not found', async () => {
      // Test error case
    });
  });
});
```

### Integration Tests

Test interactions between components:
- Provider + Service
- Service + LocalStorage
- Token refresh flow

### Test Coverage

Maintain minimum coverage:
- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation

3. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
   
   Use [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `refactor:` Code refactoring
   - `test:` Test changes
   - `chore:` Build/tooling changes

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Provide clear description
   - Link related issues
   - Ensure CI passes

## Adding New Features

### Adding a New Provider

1. Create provider class extending `AuthProvider`:

```typescript
// src/core/providers/my-auth-provider.ts
export class MyAuthProvider extends AuthProvider {
  async login(credential: MyAuthCredential): Promise<AuthLoginDTO> {
    // Implementation
  }
}
```

2. Create credential class:

```typescript
export class MyAuthCredential extends AuthCredential {
  constructor(providerId: string, /* params */) {
    super(providerId);
  }
  
  get identity(): string | null {
    // Return identity
  }
  
  // Implement other methods
}
```

3. Add tests
4. Update documentation
5. Add usage example

### Adding a New Token Type

1. Implement `AuthToken` interface:

```typescript
// src/core/tokens/my-token.ts
export class MyToken implements AuthToken {
  type = 'MyToken';
  
  // Implement interface
}
```

2. Add tests
3. Document usage

## Documentation

### Code Documentation

Use JSDoc for public APIs:

```typescript
/**
 * Service for authenticating users
 * 
 * @template T - Type of AuthAccount
 * @example
 * ```typescript
 * class MyService extends AuthService<MyAccount> {
 *   // Implementation
 * }
 * ```
 */
export abstract class AuthService<T extends AuthAccount> {
  // ...
}
```

### README Updates

Update README.md when:
- Adding new features
- Changing API
- Adding dependencies
- Changing configuration

### Examples

Add examples in `examples/` directory for:
- New providers
- Integration patterns
- Advanced usage

## Issue Reporting

### Bug Reports

Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (Node version, OS, etc.)
- Code sample

### Feature Requests

Include:
- Use case description
- Proposed API
- Benefits
- Possible alternatives

## Code Review Process

PRs will be reviewed for:
- Code quality
- Test coverage
- Documentation
- Breaking changes
- Performance impact

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Publish to npm

## Questions?

- Open an issue for questions
- Join our Discord/Slack (if available)
- Email: support@example.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
