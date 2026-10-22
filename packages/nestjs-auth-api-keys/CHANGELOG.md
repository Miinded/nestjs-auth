# @miinded/nestjs-auth-api-keys

## 2.0.0

### Major Changes

- aa6b642: Require Node.js >= 24 and refresh dependencies for security fixes.

  - `engines.node` is now `>=24` (Node.js 22 is no longer supported).
  - `@miinded/nestjs-auth-jwt`: `bcrypt` is no longer a runtime dependency (it was only used in tests). This removes a native build step and the vulnerable `tar` transitive dependency for consumers.
  - Dependencies updated to their latest compatible versions.

## 1.0.1

### Patch Changes

- 28a6dee: fix: add NPM publishing support and CI improvements
