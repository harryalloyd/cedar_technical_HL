# AI Thread: Voxel Color Replacement Bug

## Goal
Fix unwanted behavior where clicking an occupied cell in Add mode replaces the voxel's color instead of doing nothing.

## Key Prompt
> Current behavior: If a voxel already exists at a grid cell (e.g., a red voxel), and I select a different color (blue) and click the same cell while in Add/Place mode, the existing voxel's color gets replaced (red → blue).
> Expected behavior: Clicking a cell that already contains a voxel in Add/Place mode should do nothing (or optionally show a subtle "occupied" feedback). The only way to change an existing voxel should be Remove mode (delete) + then place again.
> Please help me:
> 1.Diagnose the most likely cause in a typical voxel editor implementation (grid map/state + raycast hit handling).
> 2.Propose the correct logic and state checks to prevent replacement (define exact rules for Add vs Remove).
> 3.List the minimal changes I should make (what to inspect/modify: click handler, voxel keying, placement function).
> 4.Provide a quick set of acceptance criteria to confirm it's fixed.


### Root Cause
> Your current implementation likely has a "place" operation that unconditionally adds/updates the voxel Map at the clicked position, regardless of whether a voxel already exists there. In Map-based storage (`Map<string, Voxel>`), setting a key that already exists will overwrite the previous value.

### Corrected Algorithm
```typescript
function handleGridClick(position: Position, mode: 'add' | 'remove', currentColor: string) {
  const key = positionToKey(position);
  const existingVoxel = voxelMap.get(key);

  if (mode === 'add') {
    // RULE: Only add if cell is empty
    if (existingVoxel === undefined) {
      voxelMap.set(key, { position, color: currentColor });
    } else {
      // Cell occupied: do nothing (or show feedback)
    }
  }
  else if (mode === 'remove') {
    // RULE: Only remove if cell is occupied
    if (existingVoxel !== undefined) {
      voxelMap.delete(key);
    }
  }
}
```

### Key Test Cases
| Test Case | Expected Behavior |
|-----------|-------------------|
| Click empty cell in Add mode | Places voxel with current color |
| Click same cell again in Add mode | **No change** (silent fail or feedback) |
| Click occupied cell with different color in Add mode | **No change** (keeps original color) |
| Switch to Remove mode, click occupied cell | Voxel deleted |
| Rapidly click occupied cell 10 times in Add mode | Only 1 voxel, no flashing/re-rendering |

## My Decision

**Implemented strict mode separation:**
- Add mode is truly "add-only" - only places in empty cells
- Remove mode is "remove-only" - only deletes existing voxels
- No implicit "paint/replace" mode to keep UX simple
- Added visual feedback (red flash) so user knows why placement failed

**Why this approach:**
- Prevents accidental changes to existing work
- Clear mental model: Add = new blocks only
- Visual feedback educates user without being intrusive
- Aligns with MagicaVoxel's behavior (separate paint tool)

## What I Implemented

**Files changed:**
- `hooks/useVoxelState.ts` - Added `voxelMap.has(key)` guard, returns boolean
- `components/Scene.tsx` - Check return value, show red flash on failure

**Commit:** `87f8adf` - "Fix: Prevent voxel color replacement in Add mode"

**Key code changes:**
```typescript
// hooks/useVoxelState.ts
const addVoxel = useCallback((position: Position, color?: string): boolean => {
  let success = false;
  setVoxels(prev => {
    if (prev.has(key)) {
      return prev; // Don't overwrite existing voxel
    }
    const next = new Map(prev);
    next.set(key, { position, color: voxelColor });
    success = true;
    return next;
  });
  return success;
}, [selectedColor]);

// components/Scene.tsx - Added feedback
const success = onAddVoxel(gridPos);
if (!success) {
  setOccupiedFeedback(gridPos);
  setTimeout(() => setOccupiedFeedback(null), 300); // Red flash for 300ms
}
```

## Verification

**Tested via Vercel deployment:**
1. ✅ Place red voxel, click same cell with blue selected → stays red, shows red flash
2. ✅ Rapidly click occupied cell → no flashing, stable
3. ✅ Remove mode + click occupied → deletes successfully
4. ✅ Remove then Add with new color → works as expected
5. ✅ Drag detection still works (no placement during camera rotation)

**Result:** Bug fixed. Add mode is now strictly additive with clear feedback.
