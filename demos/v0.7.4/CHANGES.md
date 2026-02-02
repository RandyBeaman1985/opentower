# v0.7.4 - Polish & Optimization

**Release Date:** February 2, 2026 3:45 AM MST  
**Build:** Clean TypeScript, 8.78s build time  
**Focus:** Medium/low priority bug fixes, UX polish, performance

## 🎯 What's Fixed

### Gameplay Balance
- **Stress Decay** - People now recover from stress over time
  - Slow decay when idle (-0.1/tick)
  - Faster decay when riding elevator (-0.2/tick)
  - Eating still provides instant -10 stress bonus
  - Result: Stress system feels balanced, not just one-way punishment

### UX Improvements
- **Elevator Capacity Display** - Shows "X/15" instead of just "X"
  - Color-coded background (green/orange/red) for fullness
  - Players can see elevator load at a glance
  
- **Error Feedback** - Console warnings when placement fails
  - "Elevators need at least 2 floors" for short drags
  - "Not enough funds" when insufficient money
  - No more silent failures

### Performance & Polish
- **Population Cap** - 10,000 maximum population
  - Prevents lag with huge populations
  - Matches SimTower scale (~15K cap)
  
- **Boarding Polish** - One person boards per car per tick
  - Prevents visual overlap
  - Smoother animations

## 🐛 Bugs Fixed
- BUG-015: Stress decay (Medium)
- BUG-011: Elevator capacity display (Low)
- BUG-012: Elevator drag feedback (Medium)
- BUG-017: Population cap (Medium)
- BUG-016: Boarding overlap (Low)
- BUG-018: Sound when muted (verified already fixed)

## 🎮 Try It
1. Place office building
2. Place elevator
3. Wait for workers to spawn
4. Watch them get stressed waiting
5. Notice stress DECREASES after they board!
6. Check elevator display shows "5/15" format
7. Try dragging elevator just 1 floor (see console warning)

## 📊 Technical
- TypeScript: 0 errors
- Bundle: 413.97 kB (120.74 kB gzip)
- Modules: 721 transformed
- Build time: 8.78s

## 🔜 What's Next
- Fix critical bugs (BUG-013: people stuck, BUG-014: elevator demolish)
- Weekend schedules
- More polish based on playtesting
