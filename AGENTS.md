# AGENTS.md

## Project Context

RealPlay Backend Engineer home assignment.

Build a tournament management service using:

- NestJS with Fastify
- TypeScript (CommonJS)
- PostgreSQL with Prisma ORM
- Redis for live leaderboards
- BullMQ for background jobs

## Development Principles

### General

- Keep the implementation simple and focused on the assignment.
- Avoid overengineering and unnecessary abstractions.
- Follow NestJS conventions and modular architecture.
- Prefer readable and maintainable code.
- Use strict TypeScript typing.
- Avoid using `any`.
- Use NestJS dependency injection.
- Handle errors explicitly.

### DTO Conventions

- Each controller endpoint must have dedicated Request and Response DTOs.
- DTOs must be stored under `models/dto` within their module.
- Base DTO classes used only for inheritance must be abstract and defined in their own files under the module's `models/dto` directory.
- Request and Response DTOs for the same endpoint must be defined in the same file.
- File naming convention: `<action>-<resource>.dto.ts`.
- Class naming convention: `<Action><Resource>RequestDto` and `<Action><Resource>ResponseDto`.
- Place module-specific transformation functions in the module's `transforms` directory and reference them from DTO decorators.

### Source Layout

- Organize each domain in its own directory under `src` (for example, `src/bets` and `src/tournaments`).
- Place each module file inside its domain directory (for example, `src/bets/bets.module.ts`).
- Place shared constants, enums, and reusable validators under `src/common`, alongside `CommonModule`.
- Domain modules must import `CommonModule` when using common code.
- Register and export shared injectable providers through `CommonModule`; import static constants, enums, and validation decorators directly from their files.

### Controllers & Services

- Controllers must be placed in a `controllers` directory within their module.
- Services must be placed in a `services` directory within their module.
- Controllers must remain thin and contain no business logic.
- Controllers delegate business logic to their corresponding services.
- Controllers pass Request DTOs directly to services.
- Services return Response DTOs to controllers.
- Use dependency injection for service dependencies.
- Do not prefix controller or service parameter names with underscores, even when unused.
- Name Request DTO parameters `request` in controllers, services, and service interfaces.

### Models & Type Definitions

- Do not define standalone classes, interfaces, types, or enums inside controllers or services.
- Place model definitions in the module's `models` directory.
- DTOs belong in `models/dto` within their module.
- Use descriptive file names.
- Controllers and services must import definitions from their respective files.
- Exceptions:
  - Service interfaces may be declared in the same file as their implementation.
  - Repository interfaces may be declared in the same file as their implementation.
  - Enums must be placed in dedicated `enums` directories.

### Repository & Mapper Boundaries

- Repository methods must accept and return entities only; never pass Request or Response DTOs to repositories.
- Keep repository implementations limited to direct database operations such as select, insert, update, and delete.
- Define AutoMapper profiles in dedicated mapper files under the domain's `mappers` directory (for example, `src/bets/mappers/bet.mapper.ts`).
- Inject AutoMapper with `@InjectMapper()` in services and transaction services instead of assembling mapped objects inline.
- Mapper profiles must use explicit source and destination types.

### Service Structure & Interfaces

- Public methods must appear at the top of the class.
- Private methods must appear below all public methods.
- Every service must implement its own interface.
- Service interfaces may be defined and exported in the same file as their implementation, above the class.
- Each service must expose a Symbol token for dependency injection.
- Use interfaces as contracts and Symbols as injection tokens.

### Return Conventions

- Every function that returns a value must first assign it to a variable named `result`, except controller methods.
- Controller methods must assign service return values to a variable named `response` before returning them.
- Avoid returning expressions or function calls directly.
- Do not use early returns. Structure conditional branches so each method reaches its natural end, with value-returning methods returning `result` once at the end.
- Do not use `Object.assign`; declare explicitly typed objects instead.
- Use explicit return types for functions.

### Async Method Naming

- All asynchronous methods must have the `Async` suffix.
- Use camelCase followed by `Async`.
- Apply this convention to public and private methods, including interface declarations.
- Synchronous methods must not use the `Async` suffix.
- Framework lifecycle hooks must retain the names required by NestJS and delegate asynchronous work to methods with the `Async` suffix.

### Enum Conventions

- All enums must be defined in dedicated files inside an `enums` directory. Module-specific enums belong within their module; only enums used across modules belong in `src/common/enums`.
- Never define enums inside controllers or services.
- Use PascalCase for all enum names and enum members (for example, `Currency`).
- Each module must define its own route enums in its `enums` directory, containing only its own routes:
  - `ControllerNames`: Controller route names for that module.
  - `ActionsName`: Controller action route names for that module.
- Use these enums in controller decorators instead of hardcoded route strings.

### Constants Conventions

- Store shared constants in `src/common/constants`.
- Define regular expressions in `src/common/constants/regex.ts`.
- Do not hardcode regular expressions inside DTOs, controllers, or services.
- Use descriptive PascalCase names for shared constant objects and their keys (for example, `Regex.Currency` and `Regex.TournamentName`).
- Avoid magic strings and magic numbers when they represent reusable business rules.

## AI Collaboration Rules

- Do not implement features unless explicitly requested.
- Do not introduce dependencies without explaining why.
- Discuss architectural decisions before implementation.
- Make small, incremental changes.
- Explain important tradeoffs.
- Do not modify unrelated files.
- Do not add unnecessary features or abstractions.
- Ask before making significant architectural changes.

## Assignment Requirements

- Create tournaments with name, startsAt and endsAt.
- Ingest bet events.
- A bet may contribute to multiple tournaments.
- Ensure idempotency per tournament and externalBetId.
- Maintain live leaderboard rankings using Redis.
- Support leaderboard pagination.
- Persist final tournament placements to PostgreSQL.
- Schedule finalization using BullMQ.

## Quality

- Validate incoming requests.
- Handle duplicate events safely.
- Consider concurrency and data consistency.
- Keep README documentation updated.

## Scope

- Implement only what the assignment requires.
- Prioritize correctness, simplicity, and clear reasoning.

### Testing & Verification

- Do not create, modify, or run unit tests or E2E tests unless explicitly requested.
- Do not spend time fixing existing tests.
- For now, use `npm run build` as the only required verification.
- Prioritize implementation speed and correctness.
- Avoid unnecessary refactoring or additional verification steps.
- Tests will be implemented in a dedicated phase later.
