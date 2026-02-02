# Testing Guide for v0.8.8 - Evaluation Display

**Build:** v0.8.8  
**Date:** 2026-02-02, 11:06 AM MST  
**Feature:** BUG-025 Fix - Evaluation Scores Now Visible in Tooltips

---

## 🎯 What Was Fixed

Building evaluations (0-100% satisfaction scores) were calculated but invisible. Now they appear in building tooltips with:
- Color-coded bars (Blue/Yellow/Red)
- Numeric scores
- Detailed factor breakdowns showing WHY evaluation is low

---

## ✅ Quick Test (5 minutes)

### Test 1: Basic Evaluation Display
1. Open http://localhost:5173/ (or http://100.85.24.1:5173/)
2. Place an Office building on floor 5
3. **Hover over the office**
4. **Expected:** Tooltip shows "Evaluation" section with:
   - Score percentage (e.g. "85%")
   - Blue/Yellow/Red color-coded bar
   - Label: "Excellent" / "Fair" / "Poor"

### Test 2: Red Evaluation (Poor Placement)
1. Place Office on floor 10 (high up)
2. **Do NOT add elevator**
3. Wait for morning rush (7:30 AM) or fast-forward (speed 4)
4. Workers spawn at lobby but can't reach office
5. **Hover over office after 1-2 minutes**
6. **Expected:** 
   - Evaluation bar shows RED
   - Score shows <40%
   - Label says "Poor"
   - "Issues" section appears showing:
     - "• Elevator wait time: -XX%"

### Test 3: Blue Evaluation (Good Placement)
1. Place Office on floor 2 (low)
2. Add Standard Elevator connecting ground → floor 2
3. Wait for workers to arrive and work
4. **Hover over office after 1-2 minutes**
5. **Expected:**
   - Evaluation bar shows BLUE
   - Score shows >70%
   - Label says "Excellent"
   - No "Issues" section (nothing to fix)

### Test 4: Factor Breakdown
1. Place Office on floor 15
2. Add elevator but make it slow (1 car only)
3. Add 10+ workers to the office
4. **Hover over office during rush hour**
5. **Expected:** "Issues" section shows:
   - "• Elevator wait time: -XX%" (because elevator is crowded)
   - Possibly "• Walking distance: -XX%" if far from lobby

---

## 🎨 Visual Guide

### Excellent Building (Blue)
```
┌─────────────────────────┐
│ Office Building        │
├─────────────────────────┤
│ Evaluation        92%  │
│ ███████████████████░    │  (Blue bar)
│             Excellent   │
└─────────────────────────┘
```

### Fair Building (Yellow)
```
┌─────────────────────────┐
│ Office Building        │
├─────────────────────────┤
│ Evaluation        58%  │
│ ████████████░░░░░░░░    │  (Yellow bar)
│                   Fair  │
├─────────────────────────┤
│ Issues:                │
│ • Elevator wait: -15%  │
└─────────────────────────┘
```

### Poor Building (Red)
```
┌─────────────────────────┐
│ Office Building        │
├─────────────────────────┤
│ Evaluation        24%  │
│ ████░░░░░░░░░░░░░░░░    │  (Red bar)
│                   Poor  │
├─────────────────────────┤
│ Issues:                │
│ • Elevator wait: -40%  │
│ • Walking dist: -25%   │
│ • Missing services: -11%│
└─────────────────────────┘
```

---

## 📊 Evaluation Thresholds

| Score | Color | Label | Meaning |
|-------|-------|-------|---------|
| 70-100% | Blue | Excellent | Tenants are happy, will stay |
| 40-69% | Yellow | Fair | Some issues, risk of departure |
| 0-39% | Red | Poor | Tenants will leave next quarter |

---

## 🔍 Factor Breakdown Meanings

| Factor | What It Means | How to Fix |
|--------|---------------|------------|
| **Elevator wait time** | People wait too long for elevators | Add more elevators or cars |
| **Walking distance** | Building is too far from services | Place services closer (e.g. FastFood) |
| **Noise** | Noisy neighbors (e.g. next to Restaurant) | Move building away from noisy types |
| **Rent too high** | You're charging too much rent | Lower rent (future feature) |
| **Missing services** | Offices need nearby FastFood, Condos need Medical | Place required services |

---

## ⚠️ Known Issues

None - this is a new feature, not a bug fix migration.

---

## 🎯 Success Criteria

- [  ] Evaluation section appears in building tooltips
- [  ] Colors match evaluation level (Blue/Yellow/Red)
- [  ] Score percentage is accurate (matches calculation)
- [  ] "Issues" section only appears for buildings with problems
- [  ] Factor penalties make sense (e.g. elevator wait penalty when no elevator exists)
- [  ] Tooltip doesn't lag or flicker when hovering
- [  ] Evaluation updates over time (check after waiting 1-2 minutes)

---

## 🐛 Report Bugs

If you find issues, note:
1. What building type (Office, Hotel, etc.)
2. What floor it's on
3. What the tooltip shows (screenshot helps)
4. What you expected vs what you got
5. Browser console errors (F12)

---

**Happy Testing!**
