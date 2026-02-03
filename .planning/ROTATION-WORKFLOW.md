# Codex ↔ Opus 4.5 Rotation Workflow

## The Pattern

```
┌─────────────┐     ┌─────────────┐
│   CODEX     │────▶│   OPUS      │
│  (Builder)  │     │ (Reviewer)  │
└─────────────┘     └─────────────┘
       ▲                   │
       │                   │
       └───────────────────┘
         (Improvements)
```

## Rotation Cycle

### Round 1: Codex Builds
- Codex gets a focused task (e.g., "Polish BuildingMenu")
- Works in --full-auto mode
- Commits changes

### Round 2: Opus Reviews
- Opus reviews changes
- Runs tests/build
- Identifies issues, suggests improvements
- Documents learnings in .learnings/

### Round 3: Codex Fixes
- Codex addresses Opus feedback
- Implements improvements
- Commits

### Round 4: Opus Validates
- Final review
- Updates progress log
- Selects next task

## Current Queue

1. [ ] BuildingMenu card-based redesign
2. [ ] NotificationSystem polish
3. [ ] Building placement feel (ghost preview)
4. [ ] Time control UI
5. [ ] Color system + CSS variables
6. [ ] Animation library standardization

## Session Log

| Round | Agent | Task | Result |
|-------|-------|------|--------|
| 1 | Opus | TopBar + FinancialModal | ✅ Complete |
| 2 | Codex | BuildingMenu | 🔄 Starting... |
