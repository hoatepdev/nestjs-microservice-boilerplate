# Technology Stack

## Core Framework & Runtime

- **Node.js**: v22+ (specified in .nvmrc)
- **NestJS**: v11+ - Main application framework
- **TypeScript**: v5.7+ - Primary language with strict mode enabled
- **SWC**: Fast TypeScript/JavaScript compiler for builds

## Databases & Storage

- **PostgreSQL**: Primary relational database with TypeORM
- **MongoDB**: Document database with Mongoose
- **Redis**: Caching and session storage

## Build System & Package Management

- **Yarn**: Package manager (lockfile present)
- **NestJS CLI**: Build and development tooling
- **PM2**: Process management for production

## Testing

- **Jest**: Testing framework with 100% coverage target
- **Supertest**: HTTP assertion testing
- **Testcontainers**: Integration testing with real databases

## Code Quality & Formatting

- **ESLint**: Linting with TypeScript, security, and Jest plugins
- **Prettier**: Code formatting (single quotes, 120 char width, 2 spaces)
- **Husky**: Git hooks for pre-commit checks
- **Commitlint**: Conventional commit message enforcement

## Observability & Monitoring

- **OpenTelemetry**: Distributed tracing and metrics
- **Pino**: Structured logging with Loki transport
- **Prometheus**: Metrics collection
- **Grafana**: Visualization and dashboards
- **Zipkin**: Distributed tracing UI

## Security & Validation

- **Helmet**: Security headers
- **Zod**: Runtime type validation and schema validation
- **JWT**: Authentication tokens
- **Class-validator**: DTO validation

## Common Commands

```bash
# Development
yarn start:dev          # Start with hot reload
yarn start:debug        # Start with debugging
yarn build              # Build for production
yarn start              # Start production (with migrations)

# Database
yarn migration:run      # Run all migrations (Postgres + Mongo)
yarn migration-postgres:create  # Create new Postgres migration
yarn migration-mongo:create    # Create new Mongo migration

# Testing
yarn test               # Run unit tests
yarn test:cov          # Run tests with coverage
yarn test:load         # Run load tests with Artillery

# Code Quality
yarn lint              # Run ESLint
yarn prettier          # Format code

# Infrastructure
yarn infra             # Start Docker infrastructure
yarn scaffold          # Generate CRUD scaffolding

# Utilities
yarn check-newest:deps # Check for dependency updates
```

## Environment Requirements

- Node.js 22+
- Docker & Docker Compose (for infrastructure)
- PostgreSQL 13+
- MongoDB 5+
- Redis 6+
