# Memory Leak Audit Report
## Classical Mechanics Simulations

**Date:** 2025-11-11
**Auditor:** Claude (Automated Code Analysis)
**Scope:** Full codebase memory leak analysis per PhET guidelines

---

## Executive Summary

**CRITICAL FINDINGS:** This codebase has **extensive memory leak vulnerabilities** throughout all layers (models, views, components). The simulation currently has:

- ✅ **0 dispose methods** implemented
- ❌ **112 Property.link/lazyLink calls** with **0 unlink calls**
- ❌ **21 DerivedProperty instances** with **0 dispose calls**
- ❌ **21 addInputListener calls** with **0 removeInputListener calls**
- ❌ **0 isDisposable flags** or **assertNotDisposable** defensive code
- ❌ **Global listeners** (document.addEventListener, KeyboardListener.createGlobal) without cleanup

**Risk Level:** 🔴 **HIGH** - Screens cannot be safely disposed or switched without memory leaks

---

## 1. Heap Comparison Analysis

### Testing Requirements
The audit guidelines request heap comparison using:
```bash
grunt --minify.mangle=false
```

### Current Status
⚠️ **Not Applicable** - This project uses **Vite** build system (not Grunt/PhET build tools).

### Recommendation
For heap comparison testing:
1. Build with `npm run build`
2. Use Chrome DevTools Memory Profiler
3. Create heap snapshots:
   - Load simulation → Heap Snapshot 1
   - Switch screens multiple times → Heap Snapshot 2
   - Compare snapshots for retained objects

**Manual testing required** - Cannot be automated via this audit.

---

## 2. Common-Code Component Disposal

### Analysis of Common Code Usage

The simulation uses these SceneryStack/PhET common components:

| Component | Usage Count | Disposal Status | Files |
|-----------|-------------|-----------------|-------|
| **TimeControlNode** | 1 (BaseScreenView) | ❌ No dispose | BaseScreenView.ts:385 |
| **ResetAllButton** | 1 (BaseScreenView) | ❌ No dispose | BaseScreenView.ts:423 |
| **Stopwatch** | 4 (all screens) | ❌ No dispose | BaseScreenView.ts:225 |
| **StopwatchNode** | 4 (all screens) | ❌ No dispose | BaseScreenView.ts:233 |
| **MeasuringTapeNode** | 4 (all screens) | ❌ No dispose | BaseScreenView.ts:190 |
| **ProtractorNode** | 2 (pendulum screens) | ❌ No dispose | BaseScreenView.ts:204 |
| **InfoButton** | 1 (BaseScreenView) | ❌ No dispose | BaseScreenView.ts:452 |
| **Dialog** | 1 (BaseScreenView) | ❌ No dispose | BaseScreenView.ts:448 |
| **ConfigurableGraph** | 4 (all screens) | ❌ No dispose | BaseScreenView.ts:319 |
| **VectorNode** | 12 (3 per screen × 4 screens) | ❌ No dispose | All screen views |
| **SpringNode** | 2 (spring screens) | ❌ No dispose | SingleSpring/DoubleSpring views |
| **ParametricSpringNode** | 2 (spring screens) | ❌ No dispose | SingleSpring/DoubleSpring views |
| **ComboBox** | Multiple (presets + graphs) | ❌ No dispose | BaseScreenView.ts:659, ConfigurableGraph.ts |
| **Panel** | Multiple (all control panels) | ❌ No dispose | All screen views |
| **DragListener** | Multiple (draggable elements) | ❌ No dispose | All screen views |

### Critical Issue: BaseScreenView.ts

**File:** `src/common/view/BaseScreenView.ts`

This abstract base class is used by ALL 4 screens and has **no dispose method**. It creates numerous components that require disposal:

**Line 225-237:** Stopwatch and StopwatchNode
```typescript
this.stopwatch = new Stopwatch({ ... });
this.stopwatchNode = new StopwatchNode(this.stopwatch, { ... });
// ❌ NO dispose method to clean these up
```

**Line 190-200:** MeasuringTapeNode
```typescript
this.measuringTapeNode = new MeasuringTapeNode(unitsProperty, { ... });
// ❌ NO dispose for MeasuringTapeNode
// ❌ NO dispose for unitsProperty
// ❌ NO dispose for basePositionProperty
// ❌ NO dispose for tipPositionProperty
```

**Line 204-220:** ProtractorNode
```typescript
this.protractorNode = new ProtractorNode({ ... });
// ❌ NO dispose method
```

**Line 319-328:** ConfigurableGraph
```typescript
this.configurableGraph = new ConfigurableGraph(...);
// ❌ NO dispose method
// ConfigurableGraph itself creates GraphDataManager, GraphInteractionHandler
// All of which create listeners that are never cleaned up
```

**Line 385-415:** TimeControlNode
```typescript
const timeControlNode = new TimeControlNode(this.model.isPlayingProperty, { ... });
// ❌ NO dispose method
```

**Line 423-431:** ResetAllButton
```typescript
const resetButton = new ResetAllButton({ ... });
// ❌ NO dispose method
```

**Line 448-465:** Dialog and InfoButton
```typescript
this.infoDialog = new Dialog(infoContent, dialogOptions);
const infoButton = new InfoButton({ ... });
// ❌ NO dispose methods
```

---

## 3. AXON Observer/Listener Leaks

### Property.link() / lazyLink() Analysis

**Total Occurrences:**
- `Property.link()`: 53 calls
- `Property.lazyLink()`: 59 calls
- `Property.unlink()`: **0 calls** ❌

### Critical Files with Link Leaks

#### 3.1 BaseModel.ts (Base class for ALL 4 models)

**File:** `src/common/model/BaseModel.ts`

**Lines 46-48:** Solver type preference listener
```typescript
ClassicalMechanicsPreferences.solverTypeProperty.link((solverType: SolverType) => {
  this.solver = this.createSolver(solverType);
});
// ❌ LEAK: No unlink when model is disposed
// ❌ This listener persists even after screen is removed
```

**Lines 51-53:** Nominal time step preference listener
```typescript
ClassicalMechanicsPreferences.nominalTimeStepProperty.link((nominalTimeStep: NominalTimeStep) => {
  this.solver.setFixedTimeStep(nominalTimeStep.value);
});
// ❌ LEAK: No unlink when model is disposed
```

**Impact:** These leaks occur in the BASE MODEL, affecting all 4 screens. Every time a screen is created and removed, these listeners accumulate.

#### 3.2 BaseScreenView.ts (Base class for ALL 4 views)

**File:** `src/common/view/BaseScreenView.ts`

**Lines 240-246:** Stopwatch visibility bidirectional links
```typescript
this.showStopwatchProperty.link((visible) => {
  this.stopwatch!.isVisibleProperty.value = visible;
});

this.stopwatch.isVisibleProperty.link((visible) => {
  this.stopwatchNode!.visible = visible;
});
// ❌ LEAK: No unlink, bidirectional leak creates circular reference risk
```

**Lines 274-281:** Grid scale label template listener
```typescript
visualizationLabels.gridScaleLabelStringProperty.link((template: string) => {
  gridScaleLabel.value = template.replace("{{value}}", gridSpacing.toString());
});
// ❌ LEAK: No unlink when view is disposed
```

**Lines 603-608:** Play state accessibility announcements
```typescript
this.model.isPlayingProperty.lazyLink((isPlaying) => {
  const announcement = isPlaying ? /* ... */ : /* ... */;
  SimulationAnnouncer.announceSimulationState(announcement);
});
// ❌ LEAK: No unlink
```

**Lines 611-615:** Time speed accessibility announcements
```typescript
this.model.timeSpeedProperty.lazyLink((speed) => {
  const template = a11yStrings.speedChangedStringProperty.value;
  const announcement = template.replace("{{speed}}", speed.name);
  SimulationAnnouncer.announceSimulationState(announcement);
});
// ❌ LEAK: No unlink
```

**Lines 748-752:** Preset selection listener
```typescript
this.presetProperty.link((preset) => {
  if (preset !== "Custom" && !this.isApplyingPreset) {
    applyPresetCallback(preset);
  }
});
// ❌ LEAK: No unlink
```

**Lines 761-763:** Custom preset detection (forEach loop creating multiple listeners)
```typescript
detectCustomChangeProperties.forEach((property) => {
  property.lazyLink(detectCustomChange);
});
// ❌ LEAK: No unlink for any of these properties
// ❌ This creates N listeners (where N = number of parameters)
```

**Line 544:** DOM event listener (global)
```typescript
document.addEventListener("visibilitychange", handleVisibilityChange);
// ❌ LEAK: No removeEventListener when view is disposed
// ❌ Global DOM listener persists even after view is removed from scene graph
```

**Line 470:** Global keyboard listener
```typescript
KeyboardListener.createGlobal(this, { ... });
// ❌ LEAK: No disposal/removal when view is disposed
// ❌ Global listeners should be cleaned up
```

#### 3.3 SingleSpringScreenView.ts (Representative of all screen views)

**File:** `src/single-spring/view/SingleSpringScreenView.ts`

**Lines 159-161:** Spring constant visual update
```typescript
this.model.springConstantProperty.link((k) => {
  this.updateSpringAppearance(k);
});
// ❌ LEAK: No unlink
```

**Lines 184-186:** Mass visual size update
```typescript
this.model.massProperty.link((mass) => {
  this.updateMassSize(mass);
});
// ❌ LEAK: No unlink
```

**Lines 220-221:** Position and natural length visualization
```typescript
this.model.positionProperty.link(this.updateVisualization.bind(this));
this.model.naturalLengthProperty.link(() => this.updateVisualization(...));
// ❌ LEAK: No unlink (2 leaks)
```

**Lines 225-229:** Spring visualization preference
```typescript
ClassicalMechanicsPreferences.springVisualizationTypeProperty.lazyLink((springType) => {
  this.switchSpringVisualization(springType);
});
// ❌ LEAK: No unlink, listens to global preference
```

**Lines 254-258:** Preset application
```typescript
this.presetProperty.link((preset) => {
  if (preset !== "Custom" && !this.isApplyingPreset) {
    this.applyPreset(preset);
  }
});
// ❌ LEAK: No unlink
```

**Lines 266-269:** Custom preset detection (4 listeners)
```typescript
this.model.massProperty.lazyLink(detectCustomChange);
this.model.springConstantProperty.lazyLink(detectCustomChange);
this.model.dampingProperty.lazyLink(detectCustomChange);
this.model.gravityProperty.lazyLink(detectCustomChange);
// ❌ LEAK: 4 listeners, no unlink for any
```

**Lines 272-291:** Accessibility parameter announcements (4 listeners)
```typescript
this.model.massProperty.lazyLink((mass) => { /* announce */ });
this.model.springConstantProperty.lazyLink((springConstant) => { /* announce */ });
this.model.dampingProperty.lazyLink((damping) => { /* announce */ });
this.model.gravityProperty.lazyLink((gravity) => { /* announce */ });
// ❌ LEAK: 4 listeners, no unlink for any
```

**Lines 472-475:** Info dialog color theme
```typescript
ClassicalMechanicsColors.textColorProperty.link((color) => {
  equation.element.style.color = color.toCSS();
  variablesList.element.style.color = color.toCSS();
});
// ❌ LEAK: No unlink, listens to global color property
```

**Total leaks in SingleSpringScreenView alone:** ~18 listeners never unlinked

### 3.4 DerivedProperty Leaks

**Total Occurrences:** 21 `new DerivedProperty()` instances with **0 dispose calls**

#### Critical Examples:

**SingleSpringModel.ts (Lines 78-110):** 6 DerivedProperty instances
```typescript
// Acceleration
this.accelerationProperty = new DerivedProperty([...], (...) => {...});

// Kinetic energy
this.kineticEnergyProperty = new DerivedProperty([...], (...) => {...});

// Potential energy
this.potentialEnergyProperty = new DerivedProperty([...], (...) => {...});

// Spring potential energy
this.springPotentialEnergyProperty = new DerivedProperty([...], (...) => {...});

// Gravitational potential energy
this.gravitationalPotentialEnergyProperty = new DerivedProperty([...], (...) => {...});

// Total energy
this.totalEnergyProperty = new DerivedProperty([...], (...) => {...});

// ❌ LEAK: None of these 6 DerivedProperties are ever disposed
// ❌ Each creates internal listeners that persist
```

**SingleSpringScreenView.ts (Line 74-84):** Dynamic screen summary
```typescript
const detailsStringProperty = new DerivedProperty(
  [voicingStrings.detailsStringProperty, model.positionProperty,
   model.velocityProperty, model.springConstantProperty, model.totalEnergyProperty],
  (template, position, velocity, springConstant, energy) => { /* ... */ }
);
// ❌ LEAK: DerivedProperty never disposed
// ❌ Listens to 5 dependencies that are never cleaned up
```

**BaseScreenView.ts (Lines 379-382):** Stepper enabled state
```typescript
const stepperEnabledProperty = new DerivedProperty(
  [this.model.isPlayingProperty],
  (isPlaying) => !isPlaying,
);
// ❌ LEAK: DerivedProperty never disposed
```

**Impact:** DerivedProperty instances create internal listeners to ALL their dependencies. When not disposed, these listeners persist indefinitely, creating memory leaks for BOTH the DerivedProperty AND all its dependencies.

---

## 4. SCENERY Listener Leaks

### addInputListener() Analysis

**Total Occurrences:** 21 `addInputListener()` calls with **0 removeInputListener calls**

### Critical Examples:

#### 4.1 SingleSpringScreenView.ts (Lines 191-217)

```typescript
this.massNode.addInputListener(
  new DragListener({
    translateNode: false,
    start: (event) => { /* ... */ },
    drag: (event) => { /* ... */ },
    end: () => { /* ... */ },
  }),
);
// ❌ LEAK: DragListener never removed
// ❌ Creates event listeners that persist even after view disposal
```

**Impact:** Every screen creates multiple DragListeners for interactive elements (masses, pendulums). These are never removed, causing:
1. Memory retention of the entire listener closure
2. Potential event firing on disposed nodes
3. References to model properties that should be garbage collected

#### 4.2 GraphInteractionHandler.ts (File-wide usage)

**File:** `src/common/view/graph/GraphInteractionHandler.ts`

This file creates extensive input listeners for graph interactions (zooming, panning, data inspection). Analysis shows:

```typescript
// Multiple addInputListener calls for graph interactions
chartNode.addInputListener(panDragListener);
chartNode.addInputListener(zoomListener);
// ... many more

// ❌ LEAK: None of these are ever removed
```

**Total in this file alone:** ~12 addInputListener calls with 0 cleanup

---

## 5. TANDEM Instrumented PhetioObject Disposal

### Analysis

The codebase uses SceneryStack's Tandem system for PhET-iO instrumentation. Per the audit guidelines:

> "Creation of an instrumented PhetioObject is accompanied by dispose."

### Current Status

⚠️ **Instrumentation Incomplete** - According to `PHET_IO_INSTRUMENTATION.md`:

- Global preferences: ✅ Instrumented
- Models: ⚠️ Blocked by SceneryStack API limitations
- Views: ❌ Not instrumented yet

### Findings

**No explicit Tandem instrumentation** found in current codebase for screen-specific components. The project is using SceneryStack (not traditional PhET libraries), which may handle instrumentation differently.

**Recommendation:** Once PhET-iO instrumentation is added:
1. All instrumented objects MUST have dispose() methods
2. All tandem instances must be disposed
3. Follow PhET-iO disposal patterns

**Current Risk:** LOW (no instrumentation yet)
**Future Risk:** HIGH (when instrumentation is added without disposal)

---

## 6. Dispose Method Implementation

### Class Analysis

**Total classes analyzed:** ~75 TypeScript files
**Classes with dispose() methods:** **0** ❌
**Classes with isDisposable flag:** **0** ❌
**Classes with assertNotDisposable:** **0** ❌

### Critical Classes Missing Dispose

| Class | Type | Reason Dispose Needed | Current Status |
|-------|------|----------------------|----------------|
| **BaseModel** | Abstract Model | Links to global preferences, creates solvers | ❌ No dispose |
| **SingleSpringModel** | Model | Creates 6 DerivedProperties, state mapper | ❌ No dispose |
| **DoubleSpringModel** | Model | Creates 3 DerivedProperties, state mapper | ❌ No dispose |
| **PendulumModel** | Model | Creates 4 DerivedProperties, state mapper | ❌ No dispose |
| **DoublePendulumModel** | Model | Creates 5 DerivedProperties, state mapper | ❌ No dispose |
| **BaseScreenView** | Abstract View | Creates 10+ components, global listeners | ❌ No dispose |
| **SingleSpringScreenView** | View | Creates DerivedProperty, 18+ listeners | ❌ No dispose |
| **DoubleSpringScreenView** | View | Creates DerivedProperty, 20+ listeners | ❌ No dispose |
| **PendulumScreenView** | View | Creates DerivedProperty, 15+ listeners | ❌ No dispose |
| **DoublePendulumScreenView** | View | Creates DerivedProperty, 18+ listeners | ❌ No dispose |
| **ConfigurableGraph** | Component | Creates GraphDataManager, listeners | ❌ No dispose |
| **GraphDataManager** | Component | Creates data storage, listeners | ❌ No dispose |
| **GraphInteractionHandler** | Component | Creates 12+ input listeners | ❌ No dispose |
| **VectorNode** | Component | Renders vectors, updates on property changes | ❌ No dispose |
| **VectorNodeFactory** | Factory | Creates and links vector nodes | ❌ No dispose |
| **VectorControlPanel** | Component | Creates checkboxes with listeners | ❌ No dispose |
| **ToolsControlPanel** | Component | Creates checkboxes with listeners | ❌ No dispose |
| **ParameterControlPanel** | Component | Creates NumberControls with listeners | ❌ No dispose |
| **SceneGridNode** | Component | Links to visibility property | ❌ No dispose |
| **SpringNode** | Component | Visual spring representation | ❌ No dispose |
| **ParametricSpringNode** | Component | Visual spring representation | ❌ No dispose |

### PhET Guidelines Violations

Per PhET memory leak guidelines:

> "All classes that require a dispose function should have one."

**Violation:** Every class above requires dispose but has none.

> "All classes that do not properly override dispose should either:
> (a) use isDisposable: false, or
> (b) implement a dispose method that calls Disposable.assertNotDisposable"

**Violation:** No classes have defensive `isDisposable: false` or `assertNotDisposable`.

---

## 7. Detailed Leak Impact Analysis

### 7.1 Screen Switching Scenario

**User Action:** Switch from Single Spring → Double Spring → Pendulum → Double Pendulum → back to Single Spring

**What Happens:**

1. **First screen load (Single Spring):**
   - BaseModel creates 2 preference listeners ✅
   - SingleSpringModel creates 6 DerivedProperties ✅
   - BaseScreenView creates 10 component listeners ✅
   - SingleSpringScreenView creates 18 model listeners ✅
   - **Total: ~36 listeners/objects created**

2. **Switch to Double Spring:**
   - Previous screen views are removed from scene graph
   - **❌ NO dispose called**
   - **❌ 36 listeners remain in memory**
   - New screen creates 40+ new listeners
   - **Total retained: 76 listeners**

3. **Switch to Pendulum:**
   - **❌ 76 previous listeners still retained**
   - New screen creates 35+ new listeners
   - **Total retained: 111 listeners**

4. **Switch to Double Pendulum:**
   - **❌ 111 previous listeners still retained**
   - New screen creates 40+ new listeners
   - **Total retained: 151 listeners**

5. **Back to Single Spring:**
   - **❌ 151 previous listeners still retained**
   - New screen creates 36+ new listeners
   - **Total retained: 187 listeners** for what should be 1 screen!

**Memory Growth:** Approximately **40 listeners per screen switch** are leaked.

### 7.2 Preference Change Scenario

**User Action:** Change solver type preference 10 times

**What Happens:**

Because BaseModel links to `ClassicalMechanicsPreferences.solverTypeProperty` without unlinking:

1. Single Spring screen creates 1 listener ✅
2. Switch to Double Spring → 1 listener leaks, new screen creates 1 listener
   - **Total: 2 listeners on solverTypeProperty**
3. Switch to Pendulum → 2 listeners leak, new screen creates 1 listener
   - **Total: 3 listeners on solverTypeProperty**
4. User changes solver → **ALL 3 listeners fire**, creating 3 new solver instances
   - 2 of them are for disposed screens (memory leak)

**Impact:** Global preference properties accumulate listeners, causing:
- Multiple unnecessary solver recreations
- Retained references to disposed models
- Performance degradation with each preference change

### 7.3 Long-Running Session Scenario

**User Action:** Student uses simulation for 30 minutes, switching screens 20 times

**Estimated Memory Growth:**
- 20 screen switches × 40 listeners/switch = **800 leaked listeners**
- Each listener retains:
  - Closure scope (~500 bytes)
  - References to model/view objects (~10KB each)
- **Total estimated leak: 800 × 10KB = 8 MB minimum**

**Plus:**
- 20 × (6 to 12) DerivedProperties = 120-240 DerivedProperty instances
- Each DerivedProperty: ~2KB
- **Additional: 240-480 KB**

**Plus:**
- DOM event listeners (visibilitychange) × 20 screens = 20 global listeners
- Keyboard listeners × 20 screens = 20 global listeners
- **Risk:** Event handlers firing on disposed views

**Total estimated leak for 30-minute session: 8-10 MB**

---

## 8. Recommendations

### Priority 1: CRITICAL (Must Fix)

#### 1.1 Implement dispose() in BaseModel
**File:** `src/common/model/BaseModel.ts`

Add dispose method to unlink preference listeners:

```typescript
private solverTypeListener?: (solverType: SolverType) => void;
private nominalTimeStepListener?: (nominalTimeStep: NominalTimeStep) => void;

protected constructor() {
  // Store listener references
  this.solverTypeListener = (solverType: SolverType) => {
    this.solver = this.createSolver(solverType);
  };
  this.nominalTimeStepListener = (nominalTimeStep: NominalTimeStep) => {
    this.solver.setFixedTimeStep(nominalTimeStep.value);
  };

  // Attach listeners
  ClassicalMechanicsPreferences.solverTypeProperty.link(this.solverTypeListener);
  ClassicalMechanicsPreferences.nominalTimeStepProperty.link(this.nominalTimeStepListener);
}

public dispose(): void {
  // Unlink preference listeners
  if (this.solverTypeListener) {
    ClassicalMechanicsPreferences.solverTypeProperty.unlink(this.solverTypeListener);
  }
  if (this.nominalTimeStepListener) {
    ClassicalMechanicsPreferences.nominalTimeStepProperty.unlink(this.nominalTimeStepListener);
  }

  // Dispose properties
  this.isPlayingProperty.dispose();
  this.timeSpeedProperty.dispose();
  this.timeProperty.dispose();
}
```

**Impact:** Fixes leaks in all 4 models (base class)

#### 1.2 Implement dispose() in all Model subclasses

Each model (SingleSpringModel, DoubleSpringModel, etc.) must:

```typescript
public override dispose(): void {
  // Dispose all DerivedProperties
  this.accelerationProperty.dispose();
  this.kineticEnergyProperty.dispose();
  this.potentialEnergyProperty.dispose();
  // ... all other DerivedProperties

  // Dispose state mapper
  this.stateMapper.dispose();

  // Dispose regular properties
  this.positionProperty.dispose();
  this.velocityProperty.dispose();
  this.massProperty.dispose();
  // ... all other properties

  super.dispose(); // Call BaseModel.dispose()
}
```

#### 1.3 Implement dispose() in BaseScreenView
**File:** `src/common/view/BaseScreenView.ts`

```typescript
public dispose(): void {
  // Remove global listeners
  document.removeEventListener("visibilitychange", this.visibilityChangeHandler);

  // Dispose keyboard listener (if SceneryStack provides disposal API)
  // this.keyboardListener.dispose();

  // Unlink all property listeners
  if (this.showStopwatchPropertyListener) {
    this.showStopwatchProperty.unlink(this.showStopwatchPropertyListener);
  }
  // ... all other listeners

  // Dispose UI components
  this.stopwatch?.dispose();
  this.stopwatchNode?.dispose();
  this.measuringTapeNode?.dispose();
  this.protractorNode?.dispose();
  this.configurableGraph?.dispose();
  this.infoDialog?.dispose();

  // Dispose DerivedProperties
  this.stepperEnabledProperty?.dispose();

  // Dispose properties
  this.showDistanceToolProperty.dispose();
  this.showProtractorProperty.dispose();
  this.showStopwatchProperty.dispose();
  this.showVelocityProperty.dispose();
  this.showForceProperty.dispose();
  this.showAccelerationProperty.dispose();
  this.showGridProperty?.dispose();
  this.presetProperty?.dispose();

  super.dispose(); // Call ScreenView.dispose() if it exists
}
```

#### 1.4 Implement dispose() in all ScreenView subclasses

Each view must dispose all screen-specific listeners and DerivedProperties.

#### 1.5 Store listener references for unlinking

**Pattern to use everywhere:**

```typescript
// ❌ BAD (cannot unlink)
this.model.positionProperty.link((position) => {
  this.updateVisualization(position);
});

// ✅ GOOD (can unlink in dispose)
this.positionListener = (position: number) => {
  this.updateVisualization(position);
};
this.model.positionProperty.link(this.positionListener);

// In dispose():
this.model.positionProperty.unlink(this.positionListener);
```

### Priority 2: HIGH (Should Fix)

#### 2.1 Add isDisposable flags to non-disposable classes

For classes that should never be disposed (e.g., singletons, global utilities):

```typescript
class MyUtilityClass {
  public readonly isDisposable = false;
}
```

#### 2.2 Add assertNotDisposable for classes inheriting dispose

For classes that inherit dispose from a parent but don't properly implement it:

```typescript
import { Disposable } from 'scenerystack/...';

class MyClass extends SomeDisposableParent {
  public override dispose(): void {
    Disposable.assertNotDisposable();
  }
}
```

#### 2.3 Dispose ConfigurableGraph and children

ConfigurableGraph creates:
- GraphDataManager (stores data points)
- GraphInteractionHandler (12+ input listeners)
- ComboBox instances
- Multiple Properties

All must be disposed.

#### 2.4 Remove input listeners in dispose

```typescript
// In constructor:
this.dragListener = new DragListener({ ... });
this.massNode.addInputListener(this.dragListener);

// In dispose:
this.massNode.removeInputListener(this.dragListener);
this.dragListener.dispose(); // if DragListener is disposable
```

### Priority 3: MEDIUM (Nice to Have)

#### 3.1 Create implementation-notes.md

Document disposal strategy:

```markdown
# Memory Management

## Disposal Strategy

### Models
All models extend BaseModel and implement dispose() to:
- Unlink preference listeners
- Dispose DerivedProperties
- Dispose NumberProperties
- Call super.dispose()

### Views
All views extend BaseScreenView and implement dispose() to:
- Remove DOM event listeners
- Unlink all property listeners
- Dispose child components
- Dispose local properties
- Call super.dispose()

### Components
Reusable components (VectorNode, ConfigurableGraph, etc.) implement dispose() to clean up all internal listeners and properties.

## Non-Disposable Classes

The following classes are never disposed:
- ClassicalMechanicsPreferences (singleton, lives for app lifetime)
- ClassicalMechanicsColors (singleton, lives for app lifetime)
- StringManager (singleton, lives for app lifetime)
```

#### 3.2 Add dispose() to utility classes

Classes like VectorNodeFactory, SceneGridNode, etc. should have dispose methods if they create listeners.

#### 3.3 Create automated leak detection tests

Add unit tests that:
1. Create a screen
2. Dispose the screen
3. Check that all listeners are removed
4. Verify no retained objects

---

## 9. Testing Recommendations

### 9.1 Manual Heap Comparison Testing

Once dispose methods are implemented:

1. Open Chrome DevTools → Memory
2. Take heap snapshot (Snapshot 1)
3. Load simulation, switch through all 4 screens
4. Take heap snapshot (Snapshot 2)
5. Compare snapshots:
   - Look for retained "Detached DOM nodes"
   - Look for retained Model/View class instances
   - Filter by "BaseModel", "ScreenView", "DerivedProperty"

**Success criteria:**
- No detached screen views in Snapshot 2
- No duplicate Model instances
- No growth in listener count after full screen cycle

### 9.2 Automated Testing

Add automated tests:

```typescript
describe('Memory Leaks', () => {
  it('should dispose SingleSpringScreenView without leaks', () => {
    const model = new SingleSpringModel();
    const view = new SingleSpringScreenView(model);

    // Dispose
    view.dispose();
    model.dispose();

    // Verify all listeners removed
    // (This requires exposing listener counts or using test utilities)
  });
});
```

---

## 10. Summary Table

| Category | Found | Expected | Status |
|----------|-------|----------|--------|
| dispose() methods | 0 | ~25 | ❌ FAIL |
| Property.link calls | 53 | 53 | ✅ |
| Property.unlink calls | 0 | 53 | ❌ FAIL |
| Property.lazyLink calls | 59 | 59 | ✅ |
| DerivedProperty instances | 21 | 21 | ✅ |
| DerivedProperty.dispose calls | 0 | 21 | ❌ FAIL |
| addInputListener calls | 21 | 21 | ✅ |
| removeInputListener calls | 0 | 21 | ❌ FAIL |
| isDisposable flags | 0 | ~10 | ❌ FAIL |
| assertNotDisposable calls | 0 | ~5 | ❌ FAIL |
| Global listener cleanup | 0 | 2 | ❌ FAIL |

**Overall Score: 2/10** (Only creation patterns are correct; no cleanup)

---

## 11. Conclusion

This codebase has **severe memory leak issues** that violate all PhET memory management guidelines:

✅ **Good News:**
- Code is well-structured and organized
- Uses proper PhET patterns (Properties, DerivedProperties)
- Separation of concerns makes fixes easier

❌ **Bad News:**
- **Zero disposal implementation** across entire codebase
- **112+ listeners never unlinked**
- **21 DerivedProperties never disposed**
- **Global listeners (DOM, keyboard) persist after view disposal**
- Every screen switch leaks ~40 listeners and 8-10 KB

⚠️ **Risk Assessment:**
- **Current impact:** MEDIUM - Single-screen usage works fine
- **Future impact:** HIGH - Multi-screen usage causes memory accumulation
- **Long-term impact:** CRITICAL - Extended sessions will degrade performance

**Recommendation:** Implement dispose methods as Priority 1 before shipping production release. Start with BaseModel and BaseScreenView (affects all screens), then cascade to subclasses.

---

**Next Steps:**
1. ✅ Review this audit report
2. ⬜ Implement BaseModel.dispose() + BaseScreenView.dispose()
3. ⬜ Implement dispose() in all model subclasses
4. ⬜ Implement dispose() in all view subclasses
5. ⬜ Add disposal for common components (ConfigurableGraph, VectorNode, etc.)
6. ⬜ Add isDisposable flags and assertNotDisposable where appropriate
7. ⬜ Perform heap comparison testing
8. ⬜ Document disposal strategy in implementation-notes.md

**Estimated effort:**
- Priority 1 fixes: 16-24 hours
- Priority 2 fixes: 8-12 hours
- Priority 3 fixes + documentation: 4-8 hours
- **Total: 28-44 hours** (3.5 to 5.5 days)
