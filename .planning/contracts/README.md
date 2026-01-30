# Contracts Layer

This directory contains shared interface definitions that ALL agents must reference.

## Rules

1. **Read-Only for Build Agents**: Build agents import from `src/interfaces/` but do NOT modify contracts
2. **Architect Approval Required**: Any contract changes must be proposed and approved by Architect agent
3. **Change Proposals**: Create a file in `.planning/contract-changes/{date}-{description}.md`
4. **Versioning**: Contracts are versioned; breaking changes require version bump

## Current Contract Files

All contracts are defined in `src/interfaces/`:

- `tower.ts` - Tower, Floor, Position, Bounds
- `buildings.ts` - Building types, configs, states
- `entities.ts` - Person, pathfinding, stress
- `transport.ts` - Elevator, stairs, escalator
- `events.ts` - Event bus, game events
- `clock.ts` - Game time, tick rates
- `rendering.ts` - Sprite dimensions, camera

## Import Pattern

```typescript
// CORRECT - Import from central interfaces
import { IBuilding, BuildingType, BUILDING_CONFIGS } from '@interfaces';

// INCORRECT - Don't import from individual files
import { IBuilding } from '@interfaces/buildings';  // Avoid this
```

## Contract Modification Protocol

1. Agent proposes change in `.planning/contract-changes/{date}-{description}.md`
2. Architect reviews within same wave
3. Approved changes merged to `src/interfaces/`
4. All affected agents notified via `.planning/notifications/`
