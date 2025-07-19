# Project Structure & Architecture

## Onion Architecture Implementation

The project follows **Onion Architecture** with **Domain-Driven Design (DDD)** and **Ports and Adapters** patterns.

## Directory Structure

```
src/
├── core/                    # Domain Layer (Business Logic)
│   ├── {domain}/
│   │   ├── entity/         # Domain entities with validation
│   │   ├── repository/     # Repository interfaces (ports)
│   │   └── use-cases/      # Business use cases
│   │       └── __tests__/  # Unit tests for use cases
├── infra/                  # Infrastructure Layer
│   ├── cache/             # Caching implementations (Redis/Memory)
│   ├── database/          # Database configurations & migrations
│   │   ├── mongo/         # MongoDB setup, schemas, migrations
│   │   └── postgres/      # PostgreSQL setup, schemas, migrations
│   ├── email/             # Email service with templates
│   ├── http/              # HTTP client service
│   ├── logger/            # Logging infrastructure
│   ├── repository/        # Repository implementations (adapters)
│   └── secrets/           # Configuration management
├── libs/                   # Shared Libraries
│   ├── event/             # Event handling
│   ├── i18n/              # Internationalization
│   ├── metrics/           # Metrics collection
│   └── token/             # JWT token management
├── middlewares/            # NestJS Middleware Layer
│   ├── filters/           # Exception filters
│   ├── guards/            # Authorization guards
│   ├── interceptors/      # Request/response interceptors
│   └── middlewares/       # Custom middleware
├── modules/                # Application Layer (Controllers)
│   └── {domain}/
│       ├── adapter.ts     # Use case adapters
│       ├── controller.ts  # HTTP controllers
│       ├── module.ts      # NestJS module definition
│       └── repository.ts  # Repository implementations
└── utils/                  # Shared Utilities
    ├── decorators/        # Custom decorators
    └── [various utilities]
```

## Architecture Patterns

### Entity Pattern

- Entities in `core/{domain}/entity/` use Zod schemas for validation
- Extend `BaseEntity` class with built-in validation
- Immutable value objects with type safety

### Use Case Pattern

- Business logic isolated in `core/{domain}/use-cases/`
- Each use case implements `IUsecase` interface
- Input/output types exported for type safety
- Decorated with `@ValidateSchema` for input validation

### Repository Pattern

- Interfaces defined in `core/{domain}/repository/`
- Implementations in `infra/repository/` and `modules/{domain}/repository.ts`
- Generic `IRepository<T>` base interface
- Support for both MongoDB and PostgreSQL

### Adapter Pattern

- Controllers use adapters to interact with use cases
- Adapters defined in `modules/{domain}/adapter.ts`
- Clean separation between HTTP layer and business logic

## Naming Conventions

### Files & Directories

- **kebab-case** for file and directory names
- **PascalCase** for class names
- **camelCase** for variables and functions

### Domain Structure

- Each domain follows consistent structure: `entity/`, `repository/`, `use-cases/`
- Use cases named with pattern: `{domain}-{action}.ts` (e.g., `cat-create.ts`)
- Tests in `__tests__/` subdirectories with `.spec.ts` suffix

### Import Aliases

- `@/*` maps to `src/*`
- `@/test/*` maps to `test/*`
- Use absolute imports with aliases instead of relative paths

## Module Organization

### Core Modules (Business Domains)

- `cat/` - Example CRUD domain
- `user/` - User management
- `role/` - Role-based access control
- `permission/` - Permission management
- `reset-password/` - Password reset functionality

### Infrastructure Services

- Database connections and migrations
- Caching (Redis/Memory)
- Email service with Handlebars templates
- Logging with structured output
- HTTP client with retry logic

### Application Services

- Authentication middleware
- Authorization guards with role checking
- Request/response interceptors
- Exception handling filters

## Configuration Management

- Environment variables in `.env`
- Secrets service for configuration access
- Database configurations in respective `config.ts` files
- Separate configs for development/production

## Testing Strategy

- **Unit tests**: Use cases and entities (`*.spec.ts`)
- **Integration tests**: Controllers with Testcontainers (`*.e2e.spec.ts`)
- **100% coverage target** with Istanbul
- Mock implementations in `test/` directory
