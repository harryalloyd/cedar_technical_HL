# AI Thread: Initial Architecture & Technology Planning

## Goal
Plan the technical architecture, choose the rendering stack, and create a 48-hour development roadmap for a browser-based voxel editor (Cedar internship technical challenge).

## Key Prompt
> I'm doing a 48-hour take-home to build a browser-based voxel editor (MagicaVoxel-style) that runs fully in the browser. It must use TypeScript + Next.js and be deployed on Vercel (free tier). Core requirements: a 3D voxel grid where I can click to place/remove cubes, camera navigation (rotate/zoom/pan), and color selection (palette and/or color picker).
>
> Important: They will evaluate (1) UX polish/smoothness, (2) technical execution + readability + performance (ideally handle 1000+ voxels), (3) quality of my AI usage, and (4) communication in a demo/debrief. Submission should include a public GitHub repo, a live deployed URL, and exported/shared links (or notes) capturing the most important AI threads.
>
> Before writing any code:
> 1.Recommend the rendering stack (Three.js vs Babylon.js vs React Three Fiber, etc.)
> 2.Propose a high-level architecture: folder structure, key modules/components, and how state flows
> 3.Call out likely performance bottlenecks and mitigations you'd build in from day 1 vs later
> 4.Suggest the best stretch features by effort-to-impact, explicitly ranked
> 5.Give me a milestone plan for the 48 hours (MVP → polish → stretch)

## AI Output (Excerpted)

### 1. Rendering Stack Recommendation

**Choice: React Three Fiber (R3F) + @react-three/drei**

**Rationale:**

| Factor | Three.js (raw) | Babylon.js | **React Three Fiber** |
|--------|---------------|------------|----------------------|
| Next.js integration | Manual setup | Manual setup | ✅ Native React |
| Learning curve | Steeper | Steeper | ✅ Declarative (if you know React) |
| Dev speed (48hr) | Slower | Slower | ✅ Fastest iteration |
| Instancing support | ✅ Yes | ✅ Yes | ✅ Yes (via Three.js) |
| AI assistance | Good | Good | ✅ Best (cleaner code structure) |
| Community/docs | Excellent | Good | ✅ Excellent + R3F ecosystem |

**Decision: React Three Fiber**
- Declarative syntax = faster iteration with AI
- Built-in React integration (no manual useEffect management)
- Excellent DX with hooks like `useThree`, `useFrame`
- `@react-three/drei` provides OrbitControls, Grid helpers out-of-box
- Performance is identical to raw Three.js (it's just a React renderer for Three.js)

### 2. High-Level Architecture

**Folder Structure:**
```
app/
├── page.tsx                 # Main entry point
└── layout.tsx               # Root layout

components/
├── VoxelEditor.tsx          # Main canvas + scene wrapper (client component)
├── Scene.tsx                # Three.js scene setup (lights, camera, raycaster)
├── VoxelGrid.tsx            # Renders all voxels from state
├── Voxel.tsx                # Individual voxel (memoized for performance)
└── UI/
    ├── ColorPicker.tsx      # Color selection interface
    ├── Toolbar.tsx          # Tool selection (add/remove mode)
    └── Instructions.tsx     # User guidance overlay

hooks/
├── useVoxelState.ts         # Voxel data management (Map-based)
└── (future) useKeyboardControls.ts

types/
└── voxel.ts                 # Type definitions

utils/
├── voxelHelpers.ts          # Grid position calculations
└── constants.ts             # Grid size, default colors
```

**State Flow:**
```
User Input (click/drag)
  ↓
Scene.tsx (raycaster)
  ↓
Calculate grid position
  ↓
useVoxelState hook (Map<string, Voxel>)
  ↓
VoxelGrid re-renders (React.memo optimization)
  ↓
Only changed Voxels re-render
```

**Data Structure (Critical for Performance):**
```typescript
// Use Map with string keys for O(1) lookups
type Position = { x: number; y: number; z: number };
type Voxel = { position: Position; color: string };
type VoxelMap = Map<string, Voxel>; // key: "x,y,z"

// Helper functions
positionToKey(pos: Position) => string // "(0.5,0.5,0.5)"
keyToPosition(key: string) => Position
```

### 3. Performance Bottlenecks & Mitigations

**Bottleneck 1: Rendering 1000+ Voxels**
- **Problem:** Individual meshes for each voxel = expensive
- **Day 1 mitigation:**
  - ✅ Use `React.memo` on Voxel component
  - ✅ Map-based storage (O(1) lookups)
  - ✅ Shared materials (one per color)
- **Later optimization:** InstancedMesh for same-colored voxels (only if needed)

**Bottleneck 2: Raycasting (Click Detection)**
- **Problem:** Raycasting 1000+ voxels every click = slow
- **Day 1 mitigation:**
  - ✅ Raycast ground plane only, calculate grid position mathematically
  - ✅ NOT raycasting individual voxels for placement
- **Only raycast voxels for:** Remove mode (detecting which to delete)

**Bottleneck 3: React Re-renders**
- **Problem:** Adding one voxel re-renders entire scene
- **Day 1 mitigation:**
  - ✅ Memo Voxel components
  - ✅ Use React keys (voxel position key)
  - ✅ Local state updates (no prop drilling)

**Bottleneck 4: Bundle Size (Vercel free tier)**
- **Mitigation:**
  - Use dynamic imports for heavy components
  - Three.js tree-shaking via R3F

### 4. Stretch Features (Ranked by Effort-to-Impact)

| Rank | Feature | Effort | Impact | ROI | Notes |
|------|---------|--------|--------|-----|-------|
| 1 | **Undo/Redo** | 2-3hrs | High | ⭐⭐⭐⭐⭐ | Best ROI - shows engineering maturity |
| 2 | **Keyboard shortcuts** | 1hr | Medium | ⭐⭐⭐⭐ | Quick UX win (1-9 for colors, E for erase) |
| 3 | **Text-to-voxel AI** | 4-6hrs | Very High | ⭐⭐⭐ | High risk/reward - aligns with Cedar's AI focus |
| 4 | **Basic lighting/AO** | 1-2hrs | Medium | ⭐⭐⭐ | Visual polish, easy with R3F |
| 5 | **Save/Load (localStorage)** | 2-3hrs | Medium | ⭐⭐⭐ | Practical but not essential |
| 6 | **Grid helper/axis labels** | 30min | Low | ⭐⭐ | Nice to have, trivial with drei |

**Recommended for 48 hours:**
- **Ship:** Undo/Redo + Keyboard shortcuts (4 hours total, high impact)
- **If time:** Text-to-voxel AI (differentiator for Cedar, who builds AI tools)
- **Skip:** Save/load (localStorage is simple but low impact for demo)

### 5. Milestone Plan (48 Hours)

**Phase 1: MVP (2-3 hours) - MUST HAVE**
- ✅ Next.js + R3F project setup
- ✅ Basic scene (grid, lighting, OrbitControls)
- ✅ Click to place voxel (single color)
- ✅ Click to remove voxel
- ✅ Color picker (8 swatches)
- ✅ Deploy to Vercel
- **Demo:** Working voxel editor with basic functionality

**Phase 2: Polish & Core Stretch (2-3 hours)**
- ✅ Undo/Redo system (command pattern)
- ✅ Keyboard shortcuts (1-9, E, Ctrl+Z/Y)
- ✅ Improve lighting (directional + ambient + point lights)
- ✅ Instructions overlay
- **Demo:** Polished UX with pro features

**Phase 3: Differentiator (2-4 hours) - OPTIONAL**
- ⚠️ Text-to-voxel AI generation (Claude API)
  - "red cube 3x3x3" → generates 27 voxels
  - Shows AI integration (Cedar's core business)
- OR performance testing with 1000+ voxels
- **Demo:** Unique feature that stands out

**Phase 4: Final Polish (1 hour)**
- Code cleanup and comments
- README documentation
- Export AI chat logs
- Test deployment
- **Demo:** Presentation-ready submission

### What to Leave Out (Scope Control)
- ❌ Mobile touch controls (desktop-first is fine)
- ❌ .vox file format support (complex binary format)
- ❌ Advanced drawing tools (brush, fill, etc.)
- ❌ Multiplayer/real-time features
- ❌ User accounts/authentication

## My Decision

**Followed this architecture exactly:**
- Used React Three Fiber for rendering
- Map-based voxel storage with memoized components
- Ground plane raycasting + mathematical grid calculation
- All core requirements completed in ~2 hours
- Successfully deployed to Vercel

**Why this approach worked:**
- R3F's declarative syntax enabled rapid iteration with AI assistance
- Performance strategy (Map + memo + shared materials) handled 100+ voxels smoothly
- Modular architecture made debugging and iteration easy
- Clear milestone plan kept development focused

**Deviations from plan:**
- ✅ Added expandable color picker (not in original plan, user request)
- ✅ Fixed multiple bugs (color replacement, raycast cut-through, edge placement)
- ❌ Did not implement undo/redo (stretch feature, time prioritized bug fixes)
- ❌ Did not implement text-to-voxel AI (stretch feature)

## What I Implemented

**Core Features (100% complete):**
- 3D voxel grid with place/remove functionality
- OrbitControls (rotate, zoom, pan)
- Color selection (8 swatches + expandable custom color wheel)
- Drag detection (prevents placement while rotating)
- Occupied cell feedback (red flash)
- Voxel stacking (face-based placement)

**Performance:**
- Map-based storage (O(1) voxel lookups)
- Memoized Voxel components
- Shared materials per color
- Ground plane raycasting (not per-voxel)
- Handles 100+ voxels at 60fps

**Deployment:**
- GitHub: harryalloyd/cedar_technical_HL
- Vercel: Auto-deploy on push

## Verification

**Time breakdown (actual):**
- Phase 1 (MVP): ~2 hours ✅
- Phase 2 (Bug fixes & polish): ~2 hours ✅
- Phase 3 (Stretch features): ~1 hour (color picker) ✅
- Total: ~5 hours (under 6-hour expected work)

**Features shipped:**
- All core requirements ✅
- Expandable color picker ✅
- Bug fixes for production quality ✅
- Clean, documented code ✅


**Result:** Architecture and planning were accurate. R3F choice was correct for rapid development. Performance strategy worked without needing InstancedMesh optimization.
