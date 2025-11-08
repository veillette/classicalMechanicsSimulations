# Implementation Status - Code Quality Improvements

## Overview
This document tracks the implementation status of the code quality improvements identified in the code review.

## Phase 1: Infrastructure (COMPLETED ✅)

All foundational files have been created to support the refactoring:

### Constant Files Created (10/10) ✅
1. ✅ `src/common/view/VectorScaleConstants.ts` - Vector visualization scales
2. ✅ `src/common/view/FontSizeConstants.ts` - Standard font sizes
3. ✅ `src/common/view/UILayoutConstants.ts` - Spacing and margins
4. ✅ `src/common/view/DialogAndPanelConstants.ts` - Dialog/panel dimensions
5. ✅ `src/common/model/SimulationParameterRanges.ts` - Physics parameter ranges
6. ✅ `src/common/view/SpringVisualizationConstants.ts` - Spring parameters
7. ✅ `src/common/view/ControlLayoutConstants.ts` - Control positioning
8. ✅ `src/common/view/graph/GraphDataConstants.ts` - Graph visualization
9. ✅ `src/common/util/AccessibilityDelayConstants.ts` - A11y delays
10. ✅ `src/common/view/ScreenIconConstants.ts` - Screen icon proportions

### Utility/Factory Files Created (3/3) ✅
1. ✅ `src/common/view/VectorNodeFactory.ts` - Factory for creating vector nodes
2. ✅ `src/common/view/PresetSelectorFactory.ts` - Factory for preset selectors
3. ✅ `src/common/util/ParameterChangeAnnouncer.ts` - Utility for parameter announcements

## Phase 2: Update Files to Use Constants (PENDING ⏳)

### High Priority - Vector Scale Constants
**Impact:** Removes 24 magic numbers (6 occurrences × 4 files)

Files to update:
- ⏳ `src/single-spring/view/SingleSpringScreenView.ts`
  - Lines 222, 230, 238: Replace `50`, `10`, `20` with constants
  - Lines 224, 232, 240: Replace `0.05`, `0.1`, `0.1` with constants

- ⏳ `src/double-spring/view/DoubleSpringScreenView.ts`
  - Lines 293, 301, 309, 318, 326, 334: Replace vector scales
  - Add corresponding min magnitudes

- ⏳ `src/pendulum/view/PendulumScreenView.ts`
  - Lines 184, 192, 200: Replace vector scales
  - Add corresponding min magnitudes

- ⏳ `src/double-pendulum/view/DoublePendulumScreenView.ts`
  - Lines 296, 304, 312, 321, 329, 337: Replace vector scales
  - Add corresponding min magnitudes

**Changes Required:**
```typescript
// BEFORE:
this.velocityVectorNode = new VectorNode({
  color: PhetColorScheme.VELOCITY,
  scale: 50, // 50 pixels per m/s
  label: "v",
  minMagnitude: 0.05,
});

// AFTER:
import {
  VELOCITY_VECTOR_SCALE,
  VELOCITY_MIN_MAGNITUDE,
} from "../../common/view/VectorScaleConstants.js";

this.velocityVectorNode = new VectorNode({
  color: PhetColorScheme.VELOCITY,
  scale: VELOCITY_VECTOR_SCALE,
  label: "v",
  minMagnitude: VELOCITY_MIN_MAGNITUDE,
});
```

### High Priority - Use VectorNodeFactory
**Impact:** Reduces ~100 lines of duplicated code

Files to update:
- ⏳ `src/single-spring/view/SingleSpringScreenView.ts` (lines 220-255)
- ⏳ `src/double-spring/view/DoubleSpringScreenView.ts` (lines 291-354)
- ⏳ `src/pendulum/view/PendulumScreenView.ts` (lines 183-210)
- ⏳ `src/double-pendulum/view/DoublePendulumScreenView.ts` (lines 295-345)

**Changes Required:**
```typescript
// BEFORE: ~35 lines of repeated code
this.velocityVectorNode = new VectorNode({...});
this.forceVectorNode = new VectorNode({...});
this.accelerationVectorNode = new VectorNode({...});

this.showVelocityProperty.link((show) => {...});
this.showForceProperty.link((show) => {...});
this.showAccelerationProperty.link((show) => {...});

// AFTER: ~10 lines
import { VectorNodeFactory } from "../../common/view/VectorNodeFactory.js";

const vectors = VectorNodeFactory.createVectorNodes();
this.velocityVectorNode = vectors.velocity;
this.forceVectorNode = vectors.force;
this.accelerationVectorNode = vectors.acceleration;

this.addChild(this.velocityVectorNode);
this.addChild(this.forceVectorNode);
this.addChild(this.accelerationVectorNode);

VectorNodeFactory.linkVectorVisibility(
  vectors,
  this.showVelocityProperty,
  this.showForceProperty,
  this.showAccelerationProperty
);
```

### High Priority - Font Size Constants
**Impact:** Removes 25+ font size magic numbers

Files to update:
- ⏳ All screen view files (SingleSpring, DoubleSpring, Pendulum, DoublePendulum)
- ⏳ `src/main.ts`
- ⏳ `src/common/view/VectorControlPanel.ts`
- ⏳ `src/common/view/ToolsControlPanel.ts`
- ⏳ `src/common/view/graph/ConfigurableGraph.ts`
- ⏳ `src/common/view/graph/GraphControlsPanel.ts`

**Changes Required:**
```typescript
// BEFORE:
font: new PhetFont({size: 12}),

// AFTER:
import { FONT_SIZE_BODY_TEXT } from "../../common/view/FontSizeConstants.js";

font: new PhetFont({size: FONT_SIZE_BODY_TEXT}),
```

### High Priority - Spring Visualization Constants
**Impact:** Removes 12 duplicated magic numbers

Files to update:
- ⏳ `src/single-spring/view/SingleSpringScreenView.ts` (lines 117, 125)
- ⏳ `src/double-spring/view/DoubleSpringScreenView.ts` (lines 102, 110, 119, 127)

**Changes Required:**
```typescript
// BEFORE:
this.classicSpringNode = new SpringNode({
  loops: 12,
  radius: 5,
  lineWidth: 1,
  leftEndLength: 5,
  rightEndLength: 5,
});

// AFTER:
import {
  SINGLE_SPRING_LOOPS,
  SPRING_RADIUS,
  SPRING_LINE_WIDTH,
  SPRING_LEFT_END_LENGTH,
  SPRING_RIGHT_END_LENGTH,
} from "../../common/view/SpringVisualizationConstants.js";

this.classicSpringNode = new SpringNode({
  loops: SINGLE_SPRING_LOOPS,
  radius: SPRING_RADIUS,
  lineWidth: SPRING_LINE_WIDTH,
  leftEndLength: SPRING_LEFT_END_LENGTH,
  rightEndLength: SPRING_RIGHT_END_LENGTH,
});
```

### High Priority - UI Layout Constants
**Impact:** Removes 15+ spacing/margin magic numbers

Files to update:
- ⏳ All screen view files
- ⏳ `src/main.ts`
- ⏳ `src/common/view/VectorControlPanel.ts`
- ⏳ `src/common/view/ToolsControlPanel.ts`

### Medium Priority - Other Constants
**Impact:** Various improvements

Files to update:
- ⏳ Dialog and panel constants → Multiple files
- ⏳ Simulation parameter ranges → All screen views
- ⏳ Control layout constants → BaseScreenView, graph components
- ⏳ Graph data constants → GraphDataManager, DoublePendulumScreenView
- ⏳ Accessibility delay constants → SimulationAnnouncer
- ⏳ Screen icon constants → All screen icon files

## Phase 3: Reduce Code Duplication (PENDING ⏳)

### Extract Preset Management to BaseScreenView
**Impact:** Reduces ~150 lines of duplicated code

Changes needed:
- ⏳ Update `BaseScreenView.ts` to add preset management methods
- ⏳ Update all 4 screen views to use base class preset management

### Use PresetSelectorFactory
**Impact:** Reduces ~80 lines of duplicated code

Files to update:
- ⏳ `src/single-spring/view/SingleSpringScreenView.ts`
- ⏳ `src/double-spring/view/DoubleSpringScreenView.ts`
- ⏳ `src/pendulum/view/PendulumScreenView.ts`
- ⏳ `src/double-pendulum/view/DoublePendulumScreenView.ts`

**Changes Required:**
```typescript
// BEFORE: ~30 lines of ComboBox creation code

// AFTER: ~5 lines
import { createPresetSelector, PresetOption } from "../../common/view/PresetSelectorFactory.js";

const presetSelector = createPresetSelector(
  this.presetProperty,
  this.presets,
  presetLabels.customStringProperty,
  this
);
```

### Use ParameterChangeAnnouncer
**Impact:** Standardizes announcement behavior, reduces ~40 lines

Files to update:
- ⏳ All screen view files (currently use inconsistent approaches)

### Extract Z-Order Management
**Impact:** Reduces ~40 lines

Changes needed:
- ⏳ Add `setupZOrder()` method to `BaseScreenView.ts`
- ⏳ Update all screen views to call base method

## Phase 4: Fix Parameter Decoupling (PENDING ⏳)

### Refactor GraphInteractionHandler
**Impact:** 12 parameters → 5 parameters

Files to update:
- ⏳ `src/common/view/graph/GraphInteractionHandler.ts`
- ⏳ `src/common/view/graph/ConfigurableGraph.ts` (call site)

### Refactor GraphDataManager
**Impact:** 10 parameters → 4 parameters

Files to update:
- ⏳ `src/common/view/graph/GraphDataManager.ts`
- ⏳ `src/common/view/graph/ConfigurableGraph.ts` (call site)

### Refactor VectorControlPanel
**Impact:** 12 properties → 4 properties

Files to update:
- ⏳ `src/common/view/VectorControlPanel.ts`
- ⏳ All screen view files (call sites)

### Refactor ToolsControlPanel
**Impact:** 18 properties → 5 properties

Files to update:
- ⏳ `src/common/view/ToolsControlPanel.ts`
- ⏳ All screen view files (call sites)

## Phase 5: Update BaseScreenView Constants (PENDING ⏳)

### Replace Local Constants with Imports
**Impact:** Removes remaining magic numbers from base class

File to update:
- ⏳ `src/common/view/BaseScreenView.ts`
  - Replace local graph layout constants (lines 247-250)
  - Replace control button radius (lines 341, 350)
  - Replace panel corner radius (line 386)

**Changes Required:**
```typescript
// BEFORE:
const GRAPH_LEFT_MARGIN = 10;
const GRAPH_RIGHT_MARGIN = 100;
const GRAPH_HEIGHT = 300;
const MAX_DATA_POINTS = 2000;

// AFTER:
import {
  GRAPH_LEFT_MARGIN,
  GRAPH_RIGHT_MARGIN,
  GRAPH_HEIGHT,
  MAX_DATA_POINTS,
  PANEL_CORNER_RADIUS,
} from "./DialogAndPanelConstants.js";
import { CONTROL_BUTTON_RADIUS } from "./ControlLayoutConstants.js";
```

## Phase 6: Update SimulationAnnouncer (PENDING ⏳)

### Replace Alert Delay Magic Numbers

File to update:
- ⏳ `src/common/util/SimulationAnnouncer.ts` (lines 40, 45)

**Changes Required:**
```typescript
// BEFORE:
alertStableDelay: 300
alertStableDelay: 200

// AFTER:
import {
  PARAMETER_CHANGE_ANNOUNCEMENT_DELAY,
  GRAPH_CHANGE_ANNOUNCEMENT_DELAY,
} from "./AccessibilityDelayConstants.js";

alertStableDelay: PARAMETER_CHANGE_ANNOUNCEMENT_DELAY
alertStableDelay: GRAPH_CHANGE_ANNOUNCEMENT_DELAY
```

## Testing Plan

After each phase:
1. Run `npm run dev` and test all 4 screens
2. Verify all functionality works:
   - Preset system
   - Vector visualization
   - All controls
   - Graph interactions
   - Measurement tools
   - Accessibility features
3. Check browser console for errors
4. Test visual appearance matches original

## Summary

**Completed:**
- ✅ 10 constant files created
- ✅ 3 utility/factory files created
- ✅ Documentation updated

**Remaining Work:**
- ⏳ Update ~20 files to use new constants (~100+ replacements)
- ⏳ Refactor 4 screen views to use factories
- ⏳ Extract common patterns to BaseScreenView
- ⏳ Refactor graph component parameters

**Estimated Impact:**
- Remove 100+ magic numbers
- Reduce code by 200-300 lines
- Improve maintainability significantly
- Centralize all design values

**Recommendation:**
Implement incrementally, phase by phase, with testing after each phase. This reduces risk and allows for easier debugging if issues arise.

## Next Steps

1. **Start with Phase 2** - Update files to use constants (highest ROI)
   - Begin with vector scale constants (24 replacements, 4 files)
   - Then use VectorNodeFactory (saves ~100 lines)
   - Then font sizes (25+ replacements)

2. **Continue with Phase 3** - Reduce code duplication
   - Use PresetSelectorFactory (saves ~80 lines)
   - Standardize parameter announcements

3. **Finish with Phases 4-6** - Structural improvements
   - Refactor graph components
   - Update base classes

Each phase can be implemented, tested, and committed separately for safety.
