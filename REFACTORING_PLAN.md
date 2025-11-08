# Refactoring Plan - Classical Mechanics Simulations

## Overview
This document outlines a systematic plan to address the code quality issues identified in the code review. The plan is organized by priority and provides detailed steps for each refactoring task.

---

## Phase 1: Extract Magic Numbers (HIGH PRIORITY)
**Estimated Time:** 4-6 hours
**Impact:** Improves maintainability, makes design changes easier

### Task 1.1: Create Vector Scale Constants
**File:** `/src/common/view/VectorScaleConstants.ts`

```typescript
/**
 * Constants for vector visualization scales.
 * These determine how many pixels represent one unit of physical quantity.
 */
export const VELOCITY_VECTOR_SCALE = 50;      // pixels per m/s
export const FORCE_VECTOR_SCALE = 10;         // pixels per Newton
export const ACCELERATION_VECTOR_SCALE = 20;  // pixels per m/s²

// Minimum magnitudes for vector display
export const VELOCITY_MIN_MAGNITUDE = 0.05;   // m/s
export const FORCE_MIN_MAGNITUDE = 0.1;       // N
export const ACCELERATION_MIN_MAGNITUDE = 0.1; // m/s²
```

**Files to Update:** (6 occurrences each)
- `src/single-spring/view/SingleSpringScreenView.ts`
- `src/double-spring/view/DoubleSpringScreenView.ts`
- `src/pendulum/view/PendulumScreenView.ts`
- `src/double-pendulum/view/DoublePendulumScreenView.ts`

### Task 1.2: Create Font Size Constants
**File:** `/src/common/view/FontSizeConstants.ts`

```typescript
/**
 * Standard font sizes used throughout the simulation UI.
 */
export const FONT_SIZE_BODY_TEXT = 12;       // Standard body text and UI labels
export const FONT_SIZE_SECONDARY_LABEL = 14; // Secondary labels and descriptions
export const FONT_SIZE_HEADER = 16;          // Header text in preferences
export const FONT_SIZE_SCREEN_TITLE = 18;    // Screen section titles
export const FONT_SIZE_PRESET_LABEL = 12;    // Preset selector items
export const FONT_SIZE_CONTROL_LABEL = 14;   // Control panel labels
```

**Files to Update:** (25+ occurrences)
- All screen view files
- `src/main.ts`
- `src/common/view/VectorControlPanel.ts`
- `src/common/view/ToolsControlPanel.ts`
- `src/common/view/graph/ConfigurableGraph.ts`
- `src/common/view/graph/GraphControlsPanel.ts`

### Task 1.3: Create UI Layout Constants
**File:** `/src/common/view/UILayoutConstants.ts`

```typescript
/**
 * Standard spacing and margin values for UI layout.
 */
// Spacing between elements
export const SPACING_SMALL = 10;      // Small gaps between elements
export const SPACING_NORMAL = 12;     // Standard spacing between items
export const SPACING_MEDIUM = 15;     // Medium gaps (e.g., panel spacing)
export const SPACING_LARGE = 20;      // Large gaps between sections

// Panel margins
export const PANEL_MARGIN_X = 10;     // Standard panel horizontal padding
export const PANEL_MARGIN_Y = 10;     // Standard panel vertical padding

// Checkbox sizing
export const CHECKBOX_BOX_WIDTH_STANDARD = 16;  // Standard checkbox size
export const CHECKBOX_BOX_WIDTH_COMPACT = 14;   // Compact checkbox size
```

**Files to Update:** (15+ occurrences)
- All screen view files
- `src/main.ts`
- `src/common/view/VectorControlPanel.ts`
- `src/common/view/ToolsControlPanel.ts`

### Task 1.4: Create Dialog and Panel Constants
**File:** `/src/common/view/DialogAndPanelConstants.ts`

```typescript
/**
 * Constants for dialog and panel sizing.
 */
// Dialog max widths
export const DIALOG_NARROW_MAX_WIDTH = 550;   // For narrower dialogs
export const DIALOG_MEDIUM_MAX_WIDTH = 600;   // For standard dialogs
export const DIALOG_WIDE_MAX_WIDTH = 700;     // For wider content areas

// Graph layout constants (move from BaseScreenView.ts)
export const GRAPH_HEIGHT = 300;              // Standard graph height
export const GRAPH_LEFT_MARGIN = 10;          // Left margin for graphs
export const GRAPH_RIGHT_MARGIN = 100;        // Right margin for graphs (axis labels)
export const MAX_DATA_POINTS = 2000;          // Maximum points in graph
export const GRAPH_TO_VECTOR_PANEL_SPACING = 10; // Space between vector panel and graph

// Panel styling
export const PANEL_CORNER_RADIUS = 10;        // Corner radius for panel containers
```

**Files to Update:** (10+ occurrences)
- All screen view files
- `src/main.ts`
- `src/common/view/BaseScreenView.ts`

### Task 1.5: Create Simulation Parameter Ranges
**File:** `/src/common/model/SimulationParameterRanges.ts`

```typescript
/**
 * Physical parameter ranges for simulation controls.
 */
// Mass ranges (kg)
export const MASS_MIN = 0.1;
export const MASS_MAX = 5.0;

// Spring constant ranges (N/m)
export const SPRING_CONSTANT_MIN = 1;
export const SPRING_CONSTANT_MAX = 50;

// Bob/mass radius ranges for visualization (pixels)
export const BOB_RADIUS_MIN_PENDULUM = 12;
export const BOB_RADIUS_MAX_PENDULUM = 35;
export const BOB_RADIUS_MIN_DOUBLE_PENDULUM = 10;
export const BOB_RADIUS_MAX_DOUBLE_PENDULUM = 30;

// Mass size ranges for spring systems (pixels)
export const MASS_SIZE_MIN_SINGLE_SPRING = 30;
export const MASS_SIZE_MAX_SINGLE_SPRING = 70;
export const MASS_SIZE_MIN_DOUBLE_SPRING = 25;
export const MASS_SIZE_MAX_DOUBLE_SPRING = 60;

// Spring line width ranges
export const LINE_WIDTH_MIN_SPRING = 1;
export const LINE_WIDTH_MAX_SPRING = 2.5;
```

**Files to Update:** (4 occurrences each)
- `src/pendulum/view/PendulumScreenView.ts`
- `src/double-pendulum/view/DoublePendulumScreenView.ts`
- `src/single-spring/view/SingleSpringScreenView.ts`
- `src/double-spring/view/DoubleSpringScreenView.ts`

### Task 1.6: Create Spring Visualization Constants
**File:** `/src/common/view/SpringVisualizationConstants.ts`

```typescript
/**
 * Constants for spring visualization parameters.
 */
export const SINGLE_SPRING_LOOPS = 12;        // Number of coils for single spring
export const DOUBLE_SPRING_LOOPS = 10;        // Number of coils for double spring
export const SPRING_RADIUS = 5;               // Radius of spring coils (pixels)
export const SPRING_LINE_WIDTH = 1;           // Spring stroke width
export const SPRING_LEFT_END_LENGTH = 5;      // Left attachment segment length
export const SPRING_RIGHT_END_LENGTH = 5;     // Right attachment segment length
```

**Files to Update:** (6 occurrences)
- `src/single-spring/view/SingleSpringScreenView.ts`
- `src/double-spring/view/DoubleSpringScreenView.ts`

### Task 1.7: Create Control Layout Constants
**File:** `/src/common/view/ControlLayoutConstants.ts`

```typescript
/**
 * Constants for control positioning and sizing.
 */
// Button and control sizing
export const CONTROL_BUTTON_RADIUS = 15;      // Standard control button radius
export const TIME_CONTROL_BOTTOM_MARGIN = 10; // Space from bottom for time controls
export const RESET_BUTTON_SIDE_MARGIN = 10;   // Space from side for reset button

// Spring wall positioning
export const WALL_Y_POSITION = 80;            // Vertical position of spring wall/anchor

// Graph resizing controls
export const GRAPH_RESIZE_HANDLE_SIZE = 12;   // Size of graph resize handles
export const GRAPH_HEADER_HEIGHT = 30;        // Height of graph header bar
export const GRAPH_MIN_WIDTH = 200;           // Minimum width when resizing graph
export const GRAPH_MIN_HEIGHT = 150;          // Minimum height when resizing graph
```

**Files to Update:**
- `src/common/view/BaseScreenView.ts`
- `src/single-spring/view/SingleSpringScreenView.ts`
- `src/double-spring/view/DoubleSpringScreenView.ts`
- `src/common/view/graph/GraphInteractionHandler.ts`
- `src/common/view/graph/GraphControlsPanel.ts`

### Task 1.8: Create Graph Data Constants
**File:** `/src/common/view/graph/GraphDataConstants.ts`

```typescript
/**
 * Constants for graph data visualization.
 */
// Opacity ranges for graph visualization
export const GRAPH_DATA_MIN_OPACITY = 0.2;  // Minimum opacity for faded data points
export const GRAPH_DATA_MAX_OPACITY = 0.8;  // Maximum opacity for recent data points

// Trail visualization
export const MAX_TRAIL_POINTS = 500;        // Maximum points in pendulum trail
```

**Files to Update:**
- `src/common/view/graph/GraphDataManager.ts`
- `src/double-pendulum/view/DoublePendulumScreenView.ts`

### Task 1.9: Create Accessibility Delay Constants
**File:** `/src/common/util/AccessibilityDelayConstants.ts`

```typescript
/**
 * Constants for voicing announcement delays.
 */
// Announcement delays (ms) - wait for rapid changes to stabilize
export const PARAMETER_CHANGE_ANNOUNCEMENT_DELAY = 300; // For slider drag events
export const GRAPH_CHANGE_ANNOUNCEMENT_DELAY = 200;     // For graph updates
```

**Files to Update:**
- `src/common/util/SimulationAnnouncer.ts`

### Task 1.10: Create Screen Icon Constants
**File:** `/src/common/view/ScreenIconConstants.ts`

```typescript
/**
 * Screen icon size proportions (relative to available space).
 */
export const SINGLE_SPRING_ICON_WIDTH_PROP = 0.6;
export const SINGLE_SPRING_ICON_HEIGHT_PROP = 0.8;

export const DOUBLE_SPRING_ICON_WIDTH_PROP = 0.5;
export const DOUBLE_SPRING_ICON_HEIGHT_PROP = 0.85;

export const PENDULUM_ICON_WIDTH_PROP = 0.6;
export const PENDULUM_ICON_HEIGHT_PROP = 0.8;

export const DOUBLE_PENDULUM_ICON_WIDTH_PROP = 0.65;
export const DOUBLE_PENDULUM_ICON_HEIGHT_PROP = 0.85;
```

**Files to Update:**
- `src/single-spring/SingleSpringScreenIcon.ts`
- `src/double-spring/DoubleSpringScreenIcon.ts`
- `src/pendulum/PendulumScreenIcon.ts`
- `src/double-pendulum/DoublePendulumScreenIcon.ts`

---

## Phase 2: Reduce Code Duplication (HIGH PRIORITY)
**Estimated Time:** 8-12 hours
**Impact:** Reduces view files by 200-300 lines (30-40%)

### Task 2.1: Extract Preset Management to BaseScreenView

**Step 1:** Add to BaseScreenView:
```typescript
// In BaseScreenView.ts
protected presetProperty: Property<PresetOption> | null = null;
protected isApplyingPreset: boolean = false;

/**
 * Setup preset management system.
 * Subclasses must implement getPresets() and applyPreset().
 */
protected setupPresetManagement(): void {
  const presets = this.getPresets();
  this.presetProperty = new Property<PresetOption>(presets[0]);

  // Listen for preset changes
  this.presetProperty.link((preset) => {
    if (preset !== "Custom" && !this.isApplyingPreset) {
      this.applyPreset(preset);
    }
  });

  // Setup custom change detection
  this.setupCustomChangeDetection();
}

/**
 * Get available presets for this screen.
 * Subclasses must implement this.
 */
protected abstract getPresets(): Preset[];

/**
 * Apply a preset to the model.
 * Subclasses must implement this.
 */
protected abstract applyPreset(preset: Preset): void;

/**
 * Setup custom change detection.
 * Subclasses should override to add listeners to their specific properties.
 */
protected abstract setupCustomChangeDetection(): void;
```

**Step 2:** Update screen views to use base class methods:
- Remove duplicated preset code
- Call `this.setupPresetManagement()` in constructor
- Implement abstract methods

**Files to Update:**
- `src/common/view/BaseScreenView.ts` (add methods)
- `src/single-spring/view/SingleSpringScreenView.ts`
- `src/double-spring/view/DoubleSpringScreenView.ts`
- `src/pendulum/view/PendulumScreenView.ts`
- `src/double-pendulum/view/DoublePendulumScreenView.ts`

**Lines Saved:** ~150-200 lines

### Task 2.2: Create Vector Node Factory

**File:** `/src/common/view/VectorNodeFactory.ts`

```typescript
import { VectorNode } from "./VectorNode.js";
import { PhetColorScheme } from "scenerystack/scenery-phet";
import { BooleanProperty } from "scenerystack/axon";
import {
  VELOCITY_VECTOR_SCALE,
  FORCE_VECTOR_SCALE,
  ACCELERATION_VECTOR_SCALE,
  VELOCITY_MIN_MAGNITUDE,
  FORCE_MIN_MAGNITUDE,
  ACCELERATION_MIN_MAGNITUDE,
} from "./VectorScaleConstants.js";

/**
 * Factory for creating standard vector nodes.
 */
export class VectorNodeFactory {
  /**
   * Create a set of vector nodes for a single mass/bob.
   */
  public static createVectorNodes(): {
    velocity: VectorNode;
    force: VectorNode;
    acceleration: VectorNode;
  } {
    return {
      velocity: new VectorNode({
        color: PhetColorScheme.VELOCITY,
        scale: VELOCITY_VECTOR_SCALE,
        label: "v",
        minMagnitude: VELOCITY_MIN_MAGNITUDE,
      }),
      force: new VectorNode({
        color: PhetColorScheme.APPLIED_FORCE,
        scale: FORCE_VECTOR_SCALE,
        label: "F",
        minMagnitude: FORCE_MIN_MAGNITUDE,
      }),
      acceleration: new VectorNode({
        color: PhetColorScheme.ACCELERATION,
        scale: ACCELERATION_VECTOR_SCALE,
        label: "a",
        minMagnitude: ACCELERATION_MIN_MAGNITUDE,
      }),
    };
  }

  /**
   * Link vector visibility to properties.
   */
  public static linkVectorVisibility(
    vectorNodes: { velocity: VectorNode; force: VectorNode; acceleration: VectorNode },
    showVelocityProperty: BooleanProperty,
    showForceProperty: BooleanProperty,
    showAccelerationProperty: BooleanProperty
  ): void {
    showVelocityProperty.link((show) => vectorNodes.velocity.setVectorVisible(show));
    showForceProperty.link((show) => vectorNodes.force.setVectorVisible(show));
    showAccelerationProperty.link((show) => vectorNodes.acceleration.setVectorVisible(show));
  }
}
```

**Files to Update:**
- `src/single-spring/view/SingleSpringScreenView.ts`
- `src/double-spring/view/DoubleSpringScreenView.ts`
- `src/pendulum/view/PendulumScreenView.ts`
- `src/double-pendulum/view/DoublePendulumScreenView.ts`

**Lines Saved:** ~100-120 lines

### Task 2.3: Create Preset Selector Factory

**File:** `/src/common/view/PresetSelectorFactory.ts`

```typescript
import { ComboBox } from "scenerystack/sun";
import { Text, Node } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Property } from "scenerystack/axon";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import { Preset } from "../model/Preset.js";
import { FONT_SIZE_PRESET_LABEL } from "./FontSizeConstants.js";

type PresetOption = Preset | "Custom";

/**
 * Factory for creating preset selector combo boxes.
 */
export function createPresetSelector(
  presetProperty: Property<PresetOption>,
  presets: Preset[],
  customLabel: Property<string>,
  listParent: Node
): ComboBox<PresetOption> {
  const presetItems: Array<{
    value: PresetOption;
    createNode: () => Node;
    tandemName: string;
  }> = [
    {
      value: "Custom",
      createNode: () =>
        new Text(customLabel, {
          font: new PhetFont({ size: FONT_SIZE_PRESET_LABEL }),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
      tandemName: "customPresetItem",
    },
    ...presets.map((preset, index) => ({
      value: preset,
      createNode: () =>
        new Text(preset.nameProperty, {
          font: new PhetFont({ size: FONT_SIZE_PRESET_LABEL }),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
      tandemName: `preset${index}Item`,
    })),
  ];

  return new ComboBox(presetProperty, presetItems, listParent, {
    cornerRadius: 5,
    xMargin: 8,
    yMargin: 4,
    buttonFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
    buttonStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
    listFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
    listStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
    highlightFill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
  });
}
```

**Files to Update:**
- All screen view files (4 files)

**Lines Saved:** ~80-100 lines

### Task 2.4: Standardize Parameter Change Announcements

**File:** `/src/common/util/ParameterChangeAnnouncer.ts`

```typescript
import { Property } from "scenerystack/axon";
import SimulationAnnouncer from "./SimulationAnnouncer.js";
import ClassicalMechanicsPreferences from "../../ClassicalMechanicsPreferences.js";

/**
 * Utility for creating parameter change listeners with consistent announcement behavior.
 */
export function createParameterChangeListener(
  property: Property<number>,
  announcementTemplate: Property<string>,
  formatValue: (value: number) => string = (v) => v.toFixed(1)
): void {
  property.lazyLink((value) => {
    if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
      const template = announcementTemplate.value;
      const announcement = template.replace("{{value}}", formatValue(value));
      SimulationAnnouncer.announceParameterChange(announcement);
    }
  });
}
```

**Files to Update:**
- All screen view files (4 files)
- Update to use template strings consistently

**Lines Saved:** ~40-60 lines

### Task 2.5: Extract Z-Order Management

**Add to BaseScreenView.ts:**
```typescript
/**
 * Setup z-order for UI elements.
 * Call this after all children have been added.
 */
protected setupZOrder(): void {
  // Move measurement tools to the very top
  if (this.measuringTapeNode) {
    this.measuringTapeNode.moveToFront();
  }
  if (this.protractorNode) {
    this.protractorNode.moveToFront();
  }
  if (this.stopwatchNode) {
    this.stopwatchNode.moveToFront();
  }

  // Subclasses can override to add their own z-order management
  this.setupScreenSpecificZOrder();
}

/**
 * Setup screen-specific z-order.
 * Subclasses can override to move their specific elements.
 */
protected setupScreenSpecificZOrder(): void {
  // Default implementation does nothing
}
```

**Files to Update:**
- `src/common/view/BaseScreenView.ts`
- All screen view files (4 files)

**Lines Saved:** ~40-50 lines

---

## Phase 3: Fix Parameter Decoupling (MEDIUM PRIORITY)
**Estimated Time:** 3-4 hours
**Impact:** Improves API clarity and reduces parameter count

### Task 3.1: Refactor GraphInteractionHandler

**Create new types:**
```typescript
interface ChartConfig {
  chartTransform: ChartTransform;
  chartRectangle: ChartRectangle;
  dataManager: GraphDataManager;
}

interface GraphUIState {
  isDraggingProperty: BooleanProperty;
  isResizingProperty: BooleanProperty;
}

interface GraphUIElements {
  headerBar: Rectangle;
  graphNode: Node;
  xTickLabelSet: TickLabelSet;
  yTickLabelSet: TickLabelSet;
}

interface GraphDimensions {
  width: number;
  height: number;
}
```

**Update constructor:**
```typescript
public constructor(
  chartConfig: ChartConfig,
  uiState: GraphUIState,
  uiElements: GraphUIElements,
  dimensions: GraphDimensions,
  onResize: (width: number, height: number) => void
)
```

**File to Update:**
- `src/common/view/graph/GraphInteractionHandler.ts`
- `src/common/view/graph/ConfigurableGraph.ts` (call site)

### Task 3.2: Refactor GraphDataManager

**Create new type:**
```typescript
interface GridVisualizationConfig {
  gridNode: GridLineSet;
  xMinorGridLinesNode: GridLineSet;
  yMinorGridLinesNode: GridLineSet;
  xTickMarksNode: TickMarkSet;
  yTickMarksNode: TickMarkSet;
  xTickLabelSet: TickLabelSet;
  yTickLabelSet: TickLabelSet;
}
```

**Update constructor:**
```typescript
public constructor(
  xProperty: PlottableProperty,
  yProperty: PlottableProperty,
  chartTransform: ChartTransform,
  gridConfig: GridVisualizationConfig
)
```

**File to Update:**
- `src/common/view/graph/GraphDataManager.ts`
- `src/common/view/graph/ConfigurableGraph.ts` (call site)

### Task 3.3: Refactor VectorControlPanel

**Use TypeScript Pick<>:**
```typescript
interface VectorConfig {
  showProperty: BooleanProperty;
  label: Property<string>;
  a11yString: Property<string>;
}

interface VectorControlPanelOptions {
  velocity: VectorConfig;
  force: VectorConfig;
  acceleration: VectorConfig;
}

// Or use Pick<> from a fuller interface:
type VectorLabels = Pick<ControlLabels, 'velocityStringProperty' | 'forceStringProperty' | 'accelerationStringProperty'>;
```

**File to Update:**
- `src/common/view/VectorControlPanel.ts`
- All screen view files (call sites)

### Task 3.4: Refactor ToolsControlPanel

**Group per tool:**
```typescript
interface ToolConfig {
  showProperty: BooleanProperty;
  label: Property<string>;
  a11yStrings: {
    visible: Property<string>;
    hidden: Property<string>;
  };
}

interface ToolsControlPanelOptions {
  grid?: ToolConfig;
  distance?: ToolConfig;
  protractor?: ToolConfig;
  stopwatch?: ToolConfig;
  graph?: ToolConfig;
  trail?: ToolConfig;
}
```

**File to Update:**
- `src/common/view/ToolsControlPanel.ts`
- All screen view files (call sites)

---

## Phase 4: Additional Improvements (LOW PRIORITY)
**Estimated Time:** 6-8 hours
**Impact:** Long-term maintainability

### Task 4.1: Create Control Panel Builder Pattern
- Extract common control panel creation logic
- Create builder methods for common patterns
- Reduce repetition in createControlPanel() methods

### Task 4.2: Consolidate Model State Management
- Review getState/setState implementations
- Consider generic implementation if state structure is consistent
- Reduce boilerplate in model classes

### Task 4.3: Verify Constant Changes Don't Break Sim
- Create test scenarios for each constant
- Verify simulation runs correctly with different values
- Document any dependencies or constraints

---

## Testing Strategy

After each phase:

1. **Run the simulation** in browser
2. **Test all 4 screens** (SingleSpring, DoubleSpring, Pendulum, DoublePendulum)
3. **Verify functionality:**
   - Preset system works
   - Vector visualization appears correctly
   - All controls function
   - Graph interactions work
   - Measurement tools work
   - Accessibility features work
4. **Visual regression testing** (compare before/after screenshots)
5. **Performance testing** (verify no performance degradation)

---

## Success Criteria

- ✅ All magic numbers replaced with named constants
- ✅ Code duplication reduced by 200-300 lines
- ✅ Constructor parameters reduced from 12+ to 5 or fewer
- ✅ All tests pass
- ✅ No visual or functional regressions
- ✅ Code is easier to maintain and modify

---

## Notes

- Commit after each major task completion
- Create feature branch for refactoring work
- Review changes carefully before merging
- Update documentation as needed
- Consider creating GitHub issues for each phase

---

## Estimated Total Time
**Phase 1:** 4-6 hours
**Phase 2:** 8-12 hours
**Phase 3:** 3-4 hours
**Phase 4:** 6-8 hours (optional)

**Total:** 21-30 hours (15-22 hours for high/medium priority only)
