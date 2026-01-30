# Phase 0 Decisions

## Date: 2025-01-29

### D001: Project Structure

**Decision**: Use flat module structure with interfaces layer

**Rationale**:
- Prevents circular dependencies (identified by Architect review)
- All shared types in `src/interfaces/`
- Each domain has its own directory

**Alternatives Considered**:
- Nested feature folders - rejected due to cross-cutting concerns
- Single flat src folder - rejected due to scale

### D002: TypeScript Path Aliases

**Decision**: Use `@/` prefix for absolute imports

**Rationale**:
- Cleaner imports, no relative path hell
- Matches modern TS conventions
- Vite and Vitest both configured

**Paths**:
- `@/*` → `src/*`
- `@core/*` → `src/core/*`
- `@interfaces/*` → `src/interfaces/*`
- etc.

### D003: Contracts Layer Location

**Decision**: Store contracts in `src/interfaces/`, documentation in `.planning/contracts/`

**Rationale**:
- Contracts are code, should be in src
- Planning docs are process, should be in .planning
- Keeps concerns separated

### D004: Web Worker Headers

**Decision**: Enable COOP/COEP headers for SharedArrayBuffer support

**Rationale**:
- Needed for zero-copy worker communication (per Scalability review)
- Configured in vite.config.ts server headers
- Fallback to Transferables for browsers without SAB

### D005: Test Framework

**Decision**: Vitest with jsdom environment

**Rationale**:
- Fast, Vite-native testing
- Compatible with PixiJS
- Same config patterns as Vite

### D006: Building Sizes (VERIFIED)

**Decision**: Use Round 2 verified values from SimTower Fandom Wiki and OpenSkyscraper

**Values Changed from Original Plan**:
- Office: 9 tiles (was incorrectly 8)
- Twin Room: 6 tiles (was incorrectly 8)
- Restaurant: 24 tiles (was incorrectly 32)
- Shop: 12 tiles (was incorrectly 16)
- Stairs: 8 tiles (was incorrectly 1)

### D007: Stress System

**Decision**: Use original SimTower stress colors (Black → Pink → Red)

**Rationale**:
- Round 1 had invented Blue/Green/Yellow colors
- Original only uses 3 stress colors
- Black (0-50), Pink (51-80), Red (81-100)
