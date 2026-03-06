# 04 - Undo/Redo History System
---

## Problem Statement

The voxel editor needed an undo/redo system to allow users to reverse and re-apply their edits. The system should feel intuitive and familiar, like browser back/forward navigation, rather than a generic undo system.

### User Requirements
## Key Prompt

> I want to add an edit history UI to my voxel editor that feels like Chrome's back/forward arrows.
>
> Requirements:
> -Two buttons: Back (undo) and Forward (redo), similar to browser navigation arrows
> -They operate on edit history (voxel changes), not camera movement
> -Actions to track: Add voxel, Remove voxel, Clear all
> -Must be reliable and easy to explain in a debrief

> Please help me (no code yet):
> Propose the best history model: command list + cursor index (like browser history) vs undo/redo stacks, and recommend one with rationale.
> Define exactly what an “edit entry” stores for each action (enough info to apply and reverse it).
> Define rules:
> Clicking Back moves the cursor back one step and reverses that edit
> Clicking Forward re-applies the next edit
> If I go back 3 steps and then make a new edit, the “forward” history is discarded (like a browser)
> Decide a reasonable max history length and how truncation should work
> UX details:
> Disabled state when you can’t go back/forward
> Keyboard shortcuts that map cleanly (Cmd/Ctrl+Z for Back, Cmd/Ctrl+Shift+Z or Ctrl+Y for Forward)
> Acceptance tests / checklist to confirm correctness (including Clear All, rapid edits, and branching history).
> After we agree on the plan, I’ll ask for implementation steps.

### Key Questions to Answer
1. What history model to use? (command list + cursor vs undo/redo stacks)
2. What data does each edit entry need to store?
3. What are the exact rules for back/forward/branching?
4. What's a reasonable max history length?
5. How should UX details work (disabled states, keyboard shortcuts)?

---

## Solution Overview

### History Model: Command List + Cursor (Browser-Style)

**Chosen approach:**
```typescript
const [history, setHistory] = useState<Command[]>([]);
const [cursor, setCursor] = useState<number>(-1);

// Example state:
// history: [cmd0, cmd1, cmd2, cmd3]
// cursor: 2 means we're "at" cmd2 (cmds 0-2 applied)
```

**Alternative considered:** Separate undo/redo stacks
```typescript
const [undoStack, setUndoStack] = useState<Command[]>([]);
const [redoStack, setRedoStack] = useState<Command[]>([]);
```

### Decision Matrix

| Factor             | Command List + Cursor ✅              | Undo/Redo Stacks                         |
|--------------------|---------------------------------------|------------------------------------------|
| Browser-like UX    | ✅ Exact match (back/forward metaphor) | ❌ Different mental model                 |
| Code simplicity    | ✅ Single array, simple cursor         | ❌ Two arrays, push/pop logic             |
| History truncation | ✅ Simple slice                        | ⚠️ Need to manage both stacks            |
| Debugging          | ✅ Easy to visualize state             | ❌ Split state harder to inspect          |
| Branching          | ✅ Natural (slice at cursor)           | ⚠️ Need to clear redo stack manually     |
| Debrief clarity    | ✅ "Cursor in array" is intuitive      | ❌ "Two stacks" requires more explanation |

**Winner:** Command list + cursor - cleaner implementation and maps directly to browser UX

---

## Data Structures

### Command Type Definition

```typescript
type CommandType = 'add' | 'remove' | 'clear';

interface Command {
  type: CommandType;
  timestamp: number;           // For debugging/logging

  // For 'add' and 'remove'
  position?: Position;
  color?: string;

  // For 'clear' (store entire state to restore)
  snapshot?: VoxelMap;         // Full Map snapshot (only for clear)
}
```

### What Each Action Stores

#### Add Voxel
```typescript
{
  type: 'add',
  position: { x: 0.5, y: 0.5, z: 0.5 },
  color: '#FF0000',
  timestamp: Date.now()
}
```
- **To undo:** Remove voxel at position
- **To redo:** Add voxel at position with color

#### Remove Voxel
```typescript
{
  type: 'remove',
  position: { x: 1.5, y: 0.5, z: 1.5 },
  color: '#00FF00',  // Store the color that was removed!
  timestamp: Date.now()
}
```
- **To undo:** Re-add voxel at position with stored color
- **To redo:** Remove voxel at position

**Important:** Must store the removed voxel's color to restore it on undo!

#### Clear All
```typescript
{
  type: 'clear',
  snapshot: new Map(previousVoxelMap), // Full copy of state before clear
  timestamp: Date.now()
}
```
- **To undo:** Restore entire voxel map from snapshot
- **To redo:** Clear all voxels

**Memory consideration:** Only stores snapshot for Clear (not every edit), limited to max 100 entries

---

## History Rules

### Core State

```typescript
const [history, setHistory] = useState<Command[]>([]);
const [cursor, setCursor] = useState<number>(-1);

// Cursor interpretation:
// -1: No commands applied (initial state)
// 0: Command 0 applied
// 2: Commands 0, 1, 2 applied
// history.length - 1: All commands applied
```

### Rule 1: Clicking Back (Undo)

```typescript
function undo() {
  if (cursor < 0) return; // Can't go back from initial state

  const command = history[cursor];
  reverseCommand(command);  // Apply the inverse
  setCursor(cursor - 1);
}
```

**Effect:** Moves cursor back one step, reverses that command

**Example:**
```
Before: [add1, add2, add3] cursor=2
After:  [add1, add2, add3] cursor=1  (add3 reversed)
```

### Rule 2: Clicking Forward (Redo)

```typescript
function redo() {
  if (cursor >= history.length - 1) return; // No forward history

  const command = history[cursor + 1];
  applyCommand(command);    // Re-apply the command
  setCursor(cursor + 1);
}
```

**Effect:** Moves cursor forward, re-applies next command

**Example:**
```
Before: [add1, add2, add3] cursor=1
After:  [add1, add2, add3] cursor=2  (add3 re-applied)
```

### Rule 3: Making New Edit After Going Back (History Branching)

```typescript
function addToHistory(command: Command) {
  // Discard everything after cursor (like browser)
  const newHistory = history.slice(0, cursor + 1);
  newHistory.push(command);

  setHistory(newHistory);
  setCursor(newHistory.length - 1);
}
```

**Example:**
```
Initial: [add1, add2, add3, add4]  cursor=3
Go back 2: [add1, add2, add3, add4]  cursor=1
Add new: [add1, add2, newAdd]  cursor=2  // add3, add4 discarded!
```

This matches browser behavior: if you go back and visit a new page, forward history is lost.

### Rule 4: Max History Length (Memory Management)

```typescript
const MAX_HISTORY = 100; // Reasonable limit

function addToHistory(command: Command) {
  let newHistory = history.slice(0, cursor + 1);
  newHistory.push(command);

  // Truncate from the START if over limit
  if (newHistory.length > MAX_HISTORY) {
    newHistory = newHistory.slice(newHistory.length - MAX_HISTORY);
    setCursor(MAX_HISTORY - 1);
  } else {
    setCursor(newHistory.length - 1);
  }

  setHistory(newHistory);
}
```

---

## Command Apply/Reverse Logic

### Apply Command (for Redo)

```typescript
function applyCommand(command: Command, voxelMap: VoxelMap): VoxelMap {
  const newMap = new Map(voxelMap);

  switch (command.type) {
    case 'add':
      const key = positionToKey(command.position!);
      newMap.set(key, { position: command.position!, color: command.color! });
      break;

    case 'remove':
      const removeKey = positionToKey(command.position!);
      newMap.delete(removeKey);
      break;

    case 'clear':
      newMap.clear();
      break;
  }

  return newMap;
}
```

### Reverse Command (for Undo)

```typescript
function reverseCommand(command: Command, voxelMap: VoxelMap): VoxelMap {
  const newMap = new Map(voxelMap);

  switch (command.type) {
    case 'add':
      // Undo add = remove
      const key = positionToKey(command.position!);
      newMap.delete(key);
      break;

    case 'remove':
      // Undo remove = add back
      const removeKey = positionToKey(command.position!);
      newMap.set(removeKey, { position: command.position!, color: command.color! });
      break;

    case 'clear':
      // Undo clear = restore snapshot
      return new Map(command.snapshot!);
  }

  return newMap;
}
```

**Key insight:** Each command type has a well-defined inverse operation

---

## UX Details

### Button Disabled States

```typescript
const canUndo = cursor >= 0;
const canRedo = cursor < history.length - 1;

<button disabled={!canUndo} onClick={undo}>
  ← Back
</button>

<button disabled={!canRedo} onClick={redo}>
  Forward →
</button>
```

### Visual Feedback

```typescript
<div className="flex gap-2">
  <button
    disabled={!canUndo}
    className={canUndo ? 'opacity-100' : 'opacity-30 cursor-not-allowed'}
    title={canUndo ? `Undo (${cursor + 1} actions)` : 'Nothing to undo'}
  >
    ← Back
  </button>

  <button
    disabled={!canRedo}
    className={canRedo ? 'opacity-100' : 'opacity-30 cursor-not-allowed'}
    title={canRedo ? `Redo (${history.length - cursor - 1} actions)` : 'Nothing to redo'}
  >
    Forward →
  </button>
</div>
```

### Keyboard Shortcuts

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    // Undo: Cmd/Ctrl + Z
    if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }

    // Redo: Cmd/Ctrl + Shift + Z (Mac/Win) OR Ctrl + Y (Win alternative)
    if ((cmdOrCtrl && e.shiftKey && e.key === 'z') ||
        (!isMac && e.ctrlKey && e.key === 'y')) {
      e.preventDefault();
      redo();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [cursor, history]);
```

**Platform-specific shortcuts:**
- **Mac:** Cmd+Z (undo), Cmd+Shift+Z (redo)
- **Windows:** Ctrl+Z (undo), Ctrl+Shift+Z or Ctrl+Y (redo)

---

### Basic Functionality

| #   | Test Case                 | Expected Behavior                  | Status |
|-----|---------------------------|------------------------------------|--------|
| 1   | Place voxel → click Back  | Voxel removed                      | ✅     |
| 2   | Remove voxel → click Back | Voxel restored with original color | ✅     |
| 3   | Back → Forward            | Returns to same state              | ✅     |
| 4   | Back → Back → Forward     | Only redoes one step               | ✅     |
| 5   | Fresh load (no history)   | Both buttons disabled              | ✅     |

### Clear All

| #   | Test Case                          | Expected Behavior                 | Status |
|-----|------------------------------------|-----------------------------------|--------|
| 6   | Place 5 voxels → Clear All → Back  | All 5 voxels restored             | ✅     |
| 7   | Clear All → Forward (no-op)        | Forward button disabled           | ✅     |
| 8   | Clear All → Back → place new voxel | New voxel added to restored state | ✅     |

### Branching History

| #   | Test Case                           | Expected Behavior                              | Status |
|-----|-------------------------------------|------------------------------------------------|--------|
| 9   | Add 3 voxels → Back twice → Add new | Forward button disabled (history truncated)    | ✅     |
| 10  | Back 5 steps → place voxel          | New voxel added, all forward history discarded | ✅     |

### Rapid Edits

| #   | Test Case                        | Expected Behavior                                 | Status |
|-----|----------------------------------|---------------------------------------------------|--------|
| 11  | Rapidly click same cell 10 times | 10 history entries (toggle add/remove)            | ✅     |
| 12  | Add 100+ voxels (exceed max)     | Oldest edits truncated, can still undo recent 100 | ✅     |
| 13  | Rapid undo (spam Cmd+Z)          | Stops at initial state, doesn't crash             | ✅     |

### Keyboard Shortcuts

| #   | Test Case                   | Expected Behavior                            | Status |
|-----|-----------------------------|----------------------------------------------|--------|
| 14  | Cmd+Z / Ctrl+Z              | Undo works                                   | ✅     |
| 15  | Cmd+Shift+Z (Mac)           | Redo works                                   | ✅     |
| 16  | Ctrl+Y (Windows)            | Redo works                                   | ✅     |
| 17  | Cmd+Z while rotating camera | Only undoes edit (doesn't interfere with 3D) | ✅     |


---

## Potential Bugs & Prevention

### Bug 1: Cursor Out of Bounds

**Risk:** Accessing `history[cursor]` when cursor is invalid

**Prevention:**
```typescript
const undo = () => {
  if (cursor < 0) return; // Guard
  // ...
};

const redo = () => {
  if (cursor >= history.length - 1) return; // Guard
  // ...
};
```

### Bug 2: Clear All Snapshot Memory Leak

**Risk:** Storing full Map snapshot for every Clear could use lots of memory


### Bug 3: React State Batching Issues

**Risk:** Rapid undo/redo might cause state inconsistencies

**Prevention:** Use functional state updates
```typescript
const undo = () => {
  setVoxels(prev => {
    const command = history[cursor];
    return reverseCommand(command, prev);
  });
  setCursor(c => c - 1);
};
```

### Bug 4: Undo/Redo During Drag

**Risk:** User drags camera, accidentally presses Cmd+Z

**Prevention:** Already handled - keyboard shortcuts only affect voxel state, not camera

---

## Implementation Checklist

### Step 1: Create Types ✅
- [x] Define `Command` interface
- [x] Create `CommandType` type
- [x] Add types to `/types/voxel.ts`

### Step 2: Add History State to useVoxelState ✅
- [x] `history: Command[]`
- [x] `cursor: number`
- [x] `MAX_HISTORY` constant (100)

### Step 3: Modify Voxel Operations ✅
- [x] Wrap `addVoxel` to push to history
- [x] Wrap `removeVoxel` to push to history (store removed color!)
- [x] Wrap `clearAll` to push to history (snapshot state)

### Step 4: Implement Undo/Redo ✅
- [x] `undo()` function
- [x] `redo()` function
- [x] `applyCommand()` helper
- [x] `reverseCommand()` helper
- [x] `canUndo` and `canRedo` computed values

### Step 5: Create UI Components ✅
- [x] `HistoryControls.tsx` component
- [x] Back button with disabled state
- [x] Forward button with disabled state
- [x] Arrow icons (using Heroicons)
- [x] Tooltips showing undo/redo count

### Step 6: Add Keyboard Shortcuts ✅
- [x] Cmd/Ctrl+Z for undo
- [x] Cmd/Ctrl+Shift+Z for redo
- [x] Ctrl+Y for redo (Windows)
- [x] Platform detection (Mac vs Windows)


---

## Key Design Decisions

### Why Command Pattern?
- **Encapsulation:** Each edit is a self-contained object
- **Reversibility:** Natural inverse operations (add ↔ remove)
- **Debuggability:** Can inspect history array in DevTools
- **Extensibility:** Easy to add new command types later

### Why Store Color on Remove?
Without storing removed color:
```
Add red voxel → Remove → Undo → ??? (color lost!)
```

With color stored:
```
Add red voxel → Remove (store red) → Undo → Red voxel restored ✓
```

### Why Snapshot for Clear?
**Alternative considered:** Store individual remove commands for each voxel

**Problem:** Clear 100 voxels = 100 history entries (wasteful)

**Solution:** Single Clear command with snapshot = 1 history entry

### Why Max History = 100?
- **User behavior:** Most users undo 1-5 steps, rarely >10
- **Performance:** 100-item array operations negligible
- **UX:** Unlimited history confusing ("How far back can I go?")

---

## Implementation Notes

### Files Modified
1. **`/types/voxel.ts`** - Added Command types
2. **`/hooks/useVoxelState.ts`** - Added history state and undo/redo logic
3. **`/components/UI/HistoryControls.tsx`** - New component for back/forward buttons
4. **`/components/VoxelEditor.tsx`** - Integrated HistoryControls, added keyboard shortcuts

### Performance
- **Undo/Redo speed:** O(1) for cursor movement, O(n) for voxel map copy (n = voxel count)
- **Memory:** O(h × v) where h = history length (100), v = avg voxels per snapshot (~10)

---

## Lessons Learned

### Command Pattern is Powerful
The command pattern naturally handles:
- Undo/redo (inverse operations)
- History branching (slice + append)
- Debugging (inspect command array)

### State Immutability Matters
Using `new Map(voxelMap)` ensures:
- No shared references between history states
- Safe undo/redo without side effects
- Predictable React re-renders

### Browser UX is Familiar
Users immediately understand "back/forward" buttons because they've used browsers for decades. Don't reinvent UI paradigms.

### Keyboard Shortcuts are Essential
Power users expect Cmd+Z to work. Not supporting it would be a dealbreaker.

---


---

## Summary

Successfully implemented a browser-style undo/redo system using the command pattern with a cursor-based history model. The system handles add, remove, and clear operations with proper reversibility, supports keyboard shortcuts, and includes comprehensive guard rails against edge cases.

**Key metrics:**
- Keyboard shortcuts: Cmd/Ctrl+Z (undo), Cmd/Ctrl+Shift+Z or Ctrl+Y (redo)

**User impact:**
- Users can confidently experiment (undo mistakes)
- Familiar browser-like UX (low learning curve)
- Reliable keyboard shortcuts (power user friendly)
