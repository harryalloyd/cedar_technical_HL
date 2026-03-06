# AI Thread: Raycast "Cut Through" Voxels Bug

## Goal
Fix bug where clicking voxels from certain angles affects multiple voxels or places voxels "through" existing ones.

## Key Prompt
> I'm seeing a raycast / picking bug in my voxel editor that causes actions to "cut through" voxels.
>
> Current behavior (Remove mode): If I click a voxel from certain angles (example: clicking the center of the front blue voxel), it can affect multiple voxels (e.g., both the blue voxel and the purple voxel behind it). At lower angles it feels like the click passes through the front voxel and hits others behind/around it.
>
> Current behavior (Add mode): This also happens in Add Voxel mode. If the purple voxel weren't there and I clicked the blue voxel from a low/shallow angle, it can "clip through" the blue voxel and place a new voxel behind it (as if the click kept going past the first voxel).
>
> Expected behavior: A click should affect only one intended target:
> -For interactions on existing voxels, it should use the closest voxel hit under the cursor (front-most intersection).
> -Remove should delete only that one voxel.
> -Add should not place a voxel "through" another voxel. Placement should be based on a single intended target (e.g., adjacent to the face hit).
>
> Please help me (no code yet):
> 1.Diagnose the most likely causes in a Three.js / R3F-style setup
> 2.Define the correct picking rules/algorithm to guarantee single-voxel targeting
> 3.Tell me exactly where to implement the fix conceptually
> 4.Provide acceptance tests / edge cases



### Root Cause
> Your raycaster is likely returning **all** intersected objects along the ray, and your code is processing multiple hits instead of just the **first (closest)** one.
>
> **Specific causes:**
> - **Ground Plane Getting Hit First:** The invisible click plane might be processed before voxel hits
> - **Event Propagation Not Stopped:** Events bubble through multiple voxels without `event.stopPropagation()`
> - **R3F Event System Returns All Intersections:** `event.intersections` array contains all hits; must filter for nearest

### Correct Picking Algorithm
```typescript
function handleClick(event) {
  const intersections = event.intersections;

  // Find first voxel hit (ignore grid/helpers)
  const firstVoxelHit = intersections.find(hit =>
    hit.object.userData.isVoxel === true
  );

  if (firstVoxelHit) {
    handleVoxelInteraction(firstVoxelHit);
    event.stopPropagation(); // CRITICAL
    return;
  }

  // No voxel hit - check for grid plane (Add mode only)
  if (currentTool === 'add') {
    const gridHit = intersections.find(hit =>
      hit.object.userData.isGridPlane === true
    );
    if (gridHit) placeVoxelOnGrid(gridHit.point);
  }
}
```

### Add Mode Face-Based Placement
```typescript
// Get face normal to determine placement direction
const normal = hit.face.normal.clone();
const hitPoint = hit.point;

// Calculate adjacent cell (offset by normal)
const adjacentPos = {
  x: Math.floor(hitPoint.x + normal.x * 0.6) + 0.5,
  y: Math.floor(hitPoint.y + normal.y * 0.6) + 0.5,
  z: Math.floor(hitPoint.z + normal.z * 0.6) + 0.5,
};

// Place voxel ADJACENT to clicked face (not at hit point)
addVoxel(adjacentPos);
```

### Where to Fix
1. **Voxel.tsx** - Add `stopPropagation()` and `userData.isVoxel`
2. **VoxelGrid.tsx** - Pass event object to click handler
3. **Scene.tsx** - Filter intersections, implement face-based placement
4. **Grid plane** - Add `userData.isGridPlane` marker

### Key Test Cases
| Test | Expected Behavior |
|------|-------------------|
| Shallow-angle click (Remove) | Only front voxel deletes |
| Click voxel in Add mode | New voxel placed **adjacent** to clicked face |
| Corner/edge clicks | Only 1 voxel affected (nearest face) |
| Drag-to-rotate | No voxel added/removed |

## My Decision

**Implemented multi-layered fix:**
- Added `event.stopPropagation()` in voxel click handlers (prevents bubbling)
- Filtered `event.intersections` to find first voxel hit only
- Added `userData` markers for object identification (isVoxel, isGridPlane)
- Implemented face-normal-based placement for Add mode
- Grid plane handler checks for voxel hits first before placing

**Why this approach:**
- **stopPropagation prevents event bubbling** - critical for multi-voxel scenarios
- **Intersection filtering uses nearest hit** - solves "cut through" issue
- **Face normal determines placement direction** - enables proper stacking
- **userData tags enable reliable filtering** - distinguishes voxels from grid/helpers

## What I Implemented

**Files changed:**
- `components/Voxel.tsx` - Added stopPropagation, userData, pass event object
- `components/VoxelGrid.tsx` - Updated signature to pass event
- `components/Scene.tsx` - Intersection filtering, face-based Add logic, grid plane check

**Commit:** `ca91a81` - "Fix raycast bug and add expandable color picker"

**Key changes:**

**1. Voxel.tsx - Stop propagation:**
```typescript
const handleClick = (event: any) => {
  event.stopPropagation(); // CRITICAL: prevent bubbling
  onClick?.(event);
};

<mesh userData={{ isVoxel: true, key }}>
```

**2. Scene.tsx - handleVoxelClick with face placement:**
```typescript
const handleVoxelClick = (key: string, event: any) => {
  event.stopPropagation();

  if (currentTool === 'add') {
    const hit = event.intersections?.[0]; // Nearest hit
    const normal = hit.face.normal.clone();

    // Place adjacent to clicked face
    const adjacentPos = {
      x: Math.floor(hitPoint.x + normal.x * 0.6) + 0.5,
      y: Math.floor(hitPoint.y + normal.y * 0.6) + 0.5,
      z: Math.floor(hitPoint.z + normal.z * 0.6) + 0.5,
    };
    onAddVoxel(adjacentPos);
  }
};
```

**3. Scene.tsx - handlePlaneClick filter:**
```typescript
// CRITICAL: Check if we hit a voxel first
const voxelHit = event.intersections?.find((hit: any) =>
  hit.object.userData?.isVoxel === true
);

if (voxelHit) {
  return; // Don't place on grid if voxel was clicked
}
```

## Verification

**Tested via local dev server:**
1. ✅ **Shallow-angle Remove:** Only front voxel deletes (not voxels behind)
2. ✅ **Add mode on voxel:** Places voxel **adjacent** to clicked face (on top/side)
3. ✅ **Vertical stacking:** Click top face → voxel placed on top
4. ✅ **No "placing through":** Cannot place voxel behind existing voxel
5. ✅ **Drag-to-rotate:** No accidental edits while rotating camera
6. ✅ **Empty grid Remove:** No action (correct)
7. ✅ **Corner clicks:** Only nearest voxel affected

**Edge cases tested:**
- Clicking at extreme shallow angles
- Rapid clicks on same voxel
- Clicking while zoomed in/out
- Clicking near grid boundaries

**Result:** Raycast bug completely fixed. Single-voxel targeting works reliably from all angles. Voxel stacking now possible (click top face to stack).
