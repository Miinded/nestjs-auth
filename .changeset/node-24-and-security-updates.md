---
'@miinded/nestjs-auth-api-keys': major
'@miinded/nestjs-auth-jwt': major
---

Require Node.js >= 24 and refresh dependencies for security fixes.

- `engines.node` is now `>=24` (Node.js 22 is no longer supported).
- `@miinded/nestjs-auth-jwt`: `bcrypt` is no longer a runtime dependency (it was only used in tests). This removes a native build step and the vulnerable `tar` transitive dependency for consumers.
- Dependencies updated to their latest compatible versions.
