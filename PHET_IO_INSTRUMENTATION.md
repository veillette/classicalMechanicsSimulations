# PhET-iO Instrumentation Progress

This document tracks the progress of PhET-iO instrumentation for the Classical Mechanics Simulations.

## Current Status: Partial Implementation

### Completed ✅

1. **Package Configuration**
   - Added `phet-io` section to `package.json` with:
     - `validation: false` (for incremental instrumentation)
     - `compareDesignedAPIChanges: false` (to avoid API comparison during development)

2. **Global Preferences Instrumentation**
   - Successfully instrumented all properties in `ClassicalMechanicsPreferences.ts`
   - All 9 preference properties now have:
     - `tandem`: Properly nested under `Tandem.PREFERENCES`
     - `phetioDocumentation`: Clear descriptions for each property
     - `phetioFeatured`: Appropriate visibility settings
   - Properties organized into three categories:
     - **Simulation Preferences**: autoPauseWhenTabHidden, solverType, nominalTimeStep, springVisualizationType
     - **Visual Preferences**: reducedMotion, highContrastMode
     - **Audio Preferences**: announceParameterChanges, announceStateChanges, announceDragInteractions

### SceneryStack Architecture Limitation 🔍

**Key Finding**: SceneryStack's `Screen` class has a different API than PhET's standard Screen class. Specifically:
- SceneryStack's Screen model/view factory functions do NOT receive tandem parameters
- Factory signatures: `() => Model` and `(model) => View`
- PhET's Screen would use: `(tandem) => Model` and `(model, tandem) => View`

This architectural difference prevents the standard PhET-iO instrumentation pattern for models and views.

### Not Yet Implemented ⏳

1. **Model Instrumentation**
   - Models (BaseModel, SingleSpringModel, DoubleSpringModel, PendulumModel, DoublePendulumModel) are not instrumented
   - All Properties in models lack tandem, phetioDocumentation, and phetioFeatured options
   - Requires investigation into SceneryStack's specific instrumentation patterns

2. **View Instrumentation**
   - Screen views are not instrumented
   - UI components (panels, buttons, checkboxes) lack PhET-iO metadata
   - Nodes with interactive elements not yet instrumented

3. **Emitter Instrumentation**
   - No data stream events configured yet

## Next Steps

### Option 1: SceneryStack-Specific Instrumentation Pattern
Investigate how SceneryStack handles PhET-iO instrumentation:
- Check if models should create their own tandems from `Tandem.ROOT`
- Determine if there's a post-construction instrumentation pattern
- Review SceneryStack documentation or examples

### Option 2: Alternative Tandem Approach
Create tandems at the screen level and pass them down:
```typescript
export class SingleSpringScreen extends Screen {
  public constructor(options: ScreenOptions) {
    const modelTandem = options.tandem.createTandem('model');
    const viewTandem = options.tandem.createTandem('view');
    super(
      () => {
        const model = new SingleSpringModel();
        // Post-creation instrumentation here?
        return model;
      },
      (model) => {
        const view = new SingleSpringScreenView(model);
        // Post-creation instrumentation here?
        return view;
      },
      options
    );
  }
}
```

### Option 3: Minimal Instrumentation
Focus only on what's currently working:
- Keep global preferences instrumented
- Add instrumentation to view-layer components that can accept tandems directly
- Document limitations of model instrumentation with SceneryStack

## Technical Notes

### Successful Instrumentation Pattern (Preferences)
```typescript
propertyName: new BooleanProperty(defaultValue, {
  tandem: Tandem.PREFERENCES.createTandem("category").createTandem("propertyName"),
  phetioDocumentation: "Description of what this controls",
  phetioFeatured: true
})
```

### Attempted Model Instrumentation (Blocked by SceneryStack API)
```typescript
// This pattern doesn't work with SceneryStack's Screen class
public constructor(tandem: Tandem) {
  super(tandem);
  this.massProperty = new NumberProperty(1.0, {
    tandem: tandem.createTandem("massProperty"),
    phetioDocumentation: "Mass in kilograms",
    phetioFeatured: true,
    units: "kg",
    range: new Range(0.1, 5.0)
  });
}
```

### Type Constraints
- `range` must use `new Range(min, max)` from "scenerystack/dot"
- Supported `units`: Limited to PhET's predefined unit types (e.g., "m", "kg", "J", "s")
- Not supported: "rad", "rad/s", "rad/s²", "m/s²", "N·m·s", "N·s/m"
- `phetioValueType: "number"` is not needed for DerivedProperty

## References

- PhET-iO Instrumentation Guide: [internal document provided]
- SceneryStack Repository: https://github.com/phetsims/scenerystack
- Package: scenerystack@3.0.0

## Build Status

✅ **Current build**: Compiles successfully with no errors
- TypeScript: All type checks pass
- Vite build: Production bundle created successfully
- All dependencies installed correctly
