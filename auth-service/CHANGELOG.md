# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-21

### Added
- Initial release of Auth Service
- Core authentication service with abstract base class
- Email authentication provider
- Phone authentication with OTP support
- JWT token management
- Basic authentication token support
- Refresh token functionality
- Local storage abstraction for persisting auth state
- RxJS streams for auth state changes
- Provider manager for handling multiple auth providers
- Comprehensive TypeScript type definitions
- LCS-specific implementation example
- Full documentation and usage examples
- Support for custom authentication providers

### Features
- 🔐 Multiple authentication providers (Email, Phone, Custom)
- 🎯 Full TypeScript support with type safety
- 🔄 Automatic token refresh
- 💾 Pluggable local storage
- 📡 Reactive state management with RxJS
- 🏗️ Clean architecture with separation of concerns
- 🔌 Easy to extend with custom providers
- 🎨 Framework agnostic (works with React, Vue, Angular, etc.)

[1.0.0]: https://github.com/lcs/auth-service/releases/tag/v1.0.0
