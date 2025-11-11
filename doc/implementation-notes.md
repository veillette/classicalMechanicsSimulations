# Classical Mechanics Simulations - Implementation Notes

This document provides technical details for developers and maintainers of the Classical Mechanics Simulations codebase. It covers architecture decisions, code organization, design patterns, and implementation considerations.

## Table of Contents

1. [Terminology](#terminology)
2. [General Considerations](#general-considerations)
3. [Architecture Overview](#architecture-overview)
4. [Model Layer](#model-layer)
5. [View Layer](#view-layer)
6. [Numerical Integration](#numerical-integration)
7. [Graph System](#graph-system)
8. [Accessibility](#accessibility)
9. [Internationalization](#internationalization)
10. [Performance Considerations](#performance-considerations)
11. [Testing and Debugging](#testing-and-debugging)

---

## Terminology

Understanding the domain-specific terminology used throughout the codebase:

- **Screen** - One of the four main simulations (Single Spring, Double Spring, Simple Pendulum, Double Pendulum)
- **Model** - The physics state and equations for a particular screen
- **View** - The visual representation and UI controls for a screen
- **State vector** - Array of numbers representing the complete dynamic state (e.g., `[position, velocity]`)
- **Derived properties** - Computed values that depend on state (e.g., acceleration, energy)
- **ODE Solver** - Numerical integration algorithm that advances the simulation state
- **Preset** - Named configuration with specific parameter values
- **Property** - Observable value from Axon framework that notifies listeners of changes
- **Node** - Visual element from Scenery scene graph (e.g., SpringNode, VectorNode)
- **Time step** - Duration of simulation time advanced per integration step
- **Parametric spring** - 3D-style spring rendering (vs. "classic" 2D coil pattern)

---

## General Considerations

### Framework and Dependencies

The simulation is built on the **SceneryStack** framework, which includes:
- **Scenery** - Scene graph and rendering (`kite`, `scenery`, `scenery-phet`)
- **Axon** - Property-based reactivity and observable patterns
- **Dot** - Mathematical utilities (Vector2, Range, etc.)
- **Sun** - UI components (buttons, sliders, panels)
- **Joist** - Simulation framework (screens, home screen, navigation bar)
- **Tambo** - Audio support
- **Utterance-Queue** - Accessibility announcements

### Coordinate Systems

All screens use standard Scenery coordinates:
- **Origin**: Top-left corner
- **+x direction**: Right
- **+y direction**: Down

Physics coordinate systems (where +y is typically up) are converted to view coordinates in the screen view classes.

### Object Lifecycle

Most objects are created at startup and persist for the application's lifetime:
- Models are instantiated once per screen
- Views are created once and reused
- Properties generally don't need disposal
- Listeners are typically attached for the lifetime of the simulation

**Exception**: Graph data and trail points are cleared on reset.

### Query Parameters

Several query parameters are available for development and debugging:
- `?ea` - Enable assertions (development mode)
- `?locale=<code>` - Set language (e.g., `?locale=es` for Spanish)
- Custom parameters can be added via `classicalMechanicsQueryParameters.ts`

### Logging and Debugging

The codebase uses several debugging mechanisms:
- `assert()` calls in development builds (stripped in production)
- `console.log()` statements (should be removed before committing)
- `ClassicalMechanicsNamespace` - Global namespace for accessing objects in browser console
- `phet.chipper.queryParameters` - Access runtime query parameters

---

## Architecture Overview

### Design Patterns

The codebase employs several design patterns:

1. **Model-View-Controller (MVC)**
   - Models: `SingleSpringModel`, `DoubleSpringModel`, `PendulumModel`, `DoublePendulumModel`
   - Views: Corresponding `*ScreenView` classes
   - Controllers: Screen classes and event handlers

2. **Template Method Pattern**
   - `BaseModel` defines the simulation stepping algorithm
   - Subclasses implement abstract methods: `getState()`, `setState()`, `getDerivatives()`
   - Enables code reuse while allowing customization

3. **Strategy Pattern**
   - ODE solvers are interchangeable strategies
   - `BaseModel` accepts any `ODESolver` implementation
   - Users can switch solvers via preferences

4. **Observer Pattern**
   - Axon Properties implement observable pattern
   - UI components observe model properties and update automatically
   - Properties use `link()`, `lazyLink()`, or `addListener()` for observation

5. **Factory Pattern**
   - `VectorNodeFactory` creates typed vector displays
   - Ensures consistent styling and behavior

6. **Singleton Pattern**
   - `StringManager` - Single instance for all localized strings
   - `ClassicalMechanicsPreferences` - Global preferences accessible everywhere

### Directory Structure

```
src/
├── main.ts                              # Application entry point
├── ClassicalMechanicsColors.ts          # Centralized color palette
├── ClassicalMechanicsPreferences.ts     # Global preferences
├── ClassicalMechanicsNamespace.ts       # Debugging namespace
│
├── common/                              # Shared across all screens
│   ├── model/                           # Physics and numerical methods
│   └── view/                            # Reusable UI components
│
├── single-spring/                       # Single spring screen
│   ├── SingleSpringScreen.ts
│   ├── model/SingleSpringModel.ts
│   └── view/SingleSpringScreenView.ts
│
├── double-spring/                       # Double spring screen
├── pendulum/                            # Simple pendulum screen
├── double-pendulum/                     # Double pendulum screen
└── i18n/                                # Internationalization
    └── StringManager.ts
```

---

## Model Layer

### BaseModel Abstract Class

Location: `src/common/model/BaseModel.ts`

`BaseModel<T>` is the abstract base class for all simulation models. The type parameter `T` represents the model-specific type (e.g., `SingleSpringModel`).

**Key Responsibilities**:
- Time management (play/pause, time speed, manual stepping)
- ODE solver creation and management
- Physics time stepping via Template Method pattern
- Common reset functionality
- Graph data management

**Abstract Methods** (must be implemented by subclasses):
```typescript
abstract getState(): number[]
abstract setState(state: number[]): void
abstract getDerivatives(state: number[]): number[]
abstract resetModel(): void
```

**Template Method** - `step(dt: number, forceStep: boolean)`:
```typescript
step(dt: number, forceStep: boolean): void {
  if (this.isPlayingProperty.value || forceStep) {
    const currentState = this.getState();
    const newState = this.solver.step(currentState, dt);
    this.setState(newState);
    this.timeProperty.value += dt;
  }
}
```

Subclasses don't override `step()`, only the abstract methods it calls.

### State Management with StatePropertyMapper

Location: `src/common/model/StatePropertyMapper.ts`

The `StatePropertyMapper` utility maps between Property objects and state arrays:

```typescript
// Define mapping
const mapper = new StatePropertyMapper([
  { property: this.positionProperty, index: 0 },
  { property: this.velocityProperty, index: 1 }
]);

// Use in getState()
getState(): number[] {
  return this.mapper.getState();
}

// Use in setState()
setState(state: number[]): void {
  this.mapper.setState(state);
}
```

This reduces boilerplate and ensures consistency.

### Concrete Model Implementations

#### SingleSpringModel

Location: `src/single-spring/model/SingleSpringModel.ts`

**State**: `[position, velocity]`

**Key Properties**:
- `massProperty: NumberProperty` - Mass in kg
- `springConstantProperty: NumberProperty` - Spring constant k in N/m
- `dampingCoefficientProperty: NumberProperty` - Damping b in N·s/m
- `positionProperty: NumberProperty` - Current position
- `velocityProperty: NumberProperty` - Current velocity
- `accelerationProperty: TReadOnlyProperty<number>` - Derived from forces
- `kineticEnergyProperty: TReadOnlyProperty<number>` - Computed KE
- `potentialEnergyProperty: TReadOnlyProperty<number>` - Computed PE
- `totalEnergyProperty: TReadOnlyProperty<number>` - Computed total

**Physics Implementation**:
```typescript
getDerivatives(state: number[]): number[] {
  const [x, v] = state;
  const m = this.massProperty.value;
  const k = this.springConstantProperty.value;
  const b = this.dampingCoefficientProperty.value;
  const g = 9.8;

  const acceleration = (-k * x - b * v + m * g) / m;

  return [v, acceleration]; // [dx/dt, dv/dt]
}
```

#### DoublePendulumModel

Location: `src/double-pendulum/model/DoublePendulumModel.ts`

**State**: `[theta1, omega1, theta2, omega2]`

This is the most complex model due to the coupled nonlinear equations. The `getDerivatives()` method solves a 2×2 linear system to find the angular accelerations:

```typescript
getDerivatives(state: number[]): number[] {
  const [theta1, omega1, theta2, omega2] = state;

  // ... extract parameters (m1, m2, L1, L2, g, b1, b2)

  // Compute trigonometric terms
  const cosTheta = Math.cos(theta1 - theta2);
  const sinTheta = Math.sin(theta1 - theta2);

  // Build coefficient matrix and right-hand side
  // Solve: [a11  a12] [alpha1] = [rhs1]
  //        [a21  a22] [alpha2]   [rhs2]

  const a11 = (m1 + m2) * L1 * L1;
  const a12 = m2 * L1 * L2 * cosTheta;
  const a21 = m2 * L1 * L2 * cosTheta;
  const a22 = m2 * L2 * L2;

  const rhs1 = /* complex expression with sin/cos terms */;
  const rhs2 = /* complex expression with sin/cos terms */;

  // Solve 2x2 system using Cramer's rule
  const det = a11 * a22 - a12 * a21;
  const alpha1 = (rhs1 * a22 - rhs2 * a12) / det;
  const alpha2 = (rhs2 * a11 - rhs1 * a21) / det;

  return [omega1, alpha1, omega2, alpha2];
}
```

### Presets

Each model has an associated presets file (e.g., `SingleSpringPresets.ts`).

**Preset Structure**:
```typescript
export type Preset = {
  name: string;                    // Display name (localized key)
  description: string;              // Description (localized key)
  config: {
    mass?: number;
    springConstant?: number;
    dampingCoefficient?: number;
    position?: number;
    velocity?: number;
    // ... other parameters
  };
};
```

Presets are loaded via:
```typescript
applyPreset(preset: Preset): void {
  Object.entries(preset.config).forEach(([key, value]) => {
    if (this[`${key}Property`]) {
      this[`${key}Property`].value = value;
    }
  });
}
```

---

## View Layer

### BaseScreenView Abstract Class

Location: `src/common/view/BaseScreenView.ts`

The abstract base for all screen views, providing common UI elements:

**Common Components**:
- Time control panel (play/pause, speed, step buttons)
- Reset all button
- Measurement tools (stopwatch, measuring tape, protractor)
- Vector control panel
- Graph display
- Keyboard shortcuts dialog

**Abstract Methods**:
```typescript
abstract createInfoDialogContent(): Node
abstract createScreenSummaryContent(): Node
```

**Layout Constants**: Uses constants from `UILayoutConstants.ts` for consistent spacing:
```typescript
const PANEL_MARGIN = 10;
const CONTROL_PANEL_X = 20;
const CONTROL_PANEL_Y = 20;
```

### Coordinate Transformations

View classes convert between physics and view coordinates:

**Springs** (physics +y is up, view +y is down):
```typescript
const viewY = this.modelViewTransform.modelToViewY(physicsY);
```

**Pendulums** (convert angle to Cartesian):
```typescript
const bobX = pivotX + length * Math.sin(theta);
const bobY = pivotY + length * Math.cos(theta); // cos because theta=0 is down
```

### SpringNode Implementations

Two spring rendering implementations:

1. **SpringNode** (`src/common/view/SpringNode.ts`)
   - Classic 2D coil pattern
   - Fast rendering
   - Uses `Shape.lineSegments()` to draw coils

2. **ParametricSpringNode** (`src/common/view/ParametricSpringNode.ts`)
   - 3D-style appearance with shading
   - More realistic
   - Uses parametric equations for helix shape

Users can switch between them via preferences.

### VectorNode and VectorNodeFactory

Location: `src/common/view/VectorNode.ts`, `src/common/view/VectorNodeFactory.ts`

**VectorNode** displays force, velocity, or acceleration vectors:
- Arrow with label
- Auto-hides when magnitude below threshold
- Configurable colors and scale factors

**VectorNodeFactory** creates typed vectors:
```typescript
createVelocityVector(
  magnitudeProperty: TReadOnlyProperty<number>,
  angleProperty: TReadOnlyProperty<number>,
  visibilityProperty: Property<boolean>
): VectorNode
```

Scale factors are defined in `VectorScaleConstants.ts`:
```typescript
export const VectorScaleConstants = {
  VELOCITY_SCALE: 0.1,    // m/s → screen pixels
  FORCE_SCALE: 0.05,      // N → screen pixels
  ACCELERATION_SCALE: 0.2 // m/s² → screen pixels
};
```

### Scene Grid

Location: `src/common/view/SceneGridNode.ts`

Optional background grid for reference:
- Configurable spacing
- Fades based on zoom level
- Toggled via checkbox in view controls

---

## Numerical Integration

### ODESolver Interface

Location: `src/common/model/ODESolver.ts`

All ODE solvers implement this interface:
```typescript
interface ODESolver {
  step(
    state: number[],
    dt: number,
    derivativesFunction: (state: number[]) => number[]
  ): number[];
}
```

### Available Solvers

#### 1. Runge-Kutta 4th Order (RK4)

Location: `src/common/model/RungeKuttaSolver.ts`

**Algorithm**:
```typescript
step(state, dt, f) {
  const k1 = f(state);
  const k2 = f(add(state, scale(k1, dt/2)));
  const k3 = f(add(state, scale(k2, dt/2)));
  const k4 = f(add(state, scale(k3, dt)));

  return add(state, scale(add(k1, scale(add(k2, k3), 2), k4), dt/6));
}
```

**Characteristics**:
- Fixed time step
- 4th order accuracy: O(dt⁴)
- Good general-purpose solver
- Default choice

#### 2. Adaptive RK45

Location: `src/common/model/AdaptiveRK45Solver.ts`

**Features**:
- Automatically adjusts step size based on error estimate
- Uses 4th and 5th order Runge-Kutta for error estimation
- More efficient for stiff systems
- Maintains user-specified error tolerance

#### 3. Forest-Ruth PEFRL

Location: `src/common/model/ForestRuthPEFRLSolver.ts`

**Characteristics**:
- Symplectic integrator
- Better energy conservation for long simulations
- Particularly useful for the double pendulum
- 4th order

#### 4. Dormand-Prince 8(7)

Location: `src/common/model/DormandPrince87Solver.ts`

**Features**:
- Very high accuracy (8th order)
- Adaptive step size
- Higher computational cost
- Best for situations requiring extreme precision

### Time Step Configuration

Time steps are defined in `src/common/model/NominalTimeStep.ts`:
```typescript
export enum NominalTimeStep {
  FINEST = 0.01,        // 0.01 ms
  VERY_SMALL = 0.1,     // 0.1 ms
  SMALL = 0.5,          // 0.5 ms
  DEFAULT = 1.0,        // 1 ms
  MEDIUM = 5.0          // 5 ms
}
```

Users can change this in preferences. Smaller steps improve accuracy but slow performance.

---

## Graph System

### ConfigurableGraph

Location: `src/common/view/graph/ConfigurableGraph.ts`

The graph component displays real-time plots of simulation data.

**Features**:
- Multiple simultaneous data series
- Auto-scaling or fixed axes
- Zoom and pan controls
- Data persistence (survives pause/resume)
- Customizable colors and labels

**Usage Pattern**:
```typescript
// In BaseScreenView
const graph = new ConfigurableGraph(
  model.timeProperty,
  [
    { property: model.positionProperty, color: Color.BLUE, label: 'Position' },
    { property: model.velocityProperty, color: Color.RED, label: 'Velocity' }
  ],
  {
    width: 400,
    height: 300,
    xLabel: 'Time (s)',
    yLabel: 'Value'
  }
);
```

### GraphDataManager

Location: `src/common/view/graph/GraphDataManager.ts`

Manages data point collection:
- Stores `[x, y]` pairs for each series
- Limits data retention (e.g., last 10,000 points)
- Provides efficient access for rendering
- Clears data on reset

### PlottableProperty

Location: `src/common/view/graph/PlottableProperty.ts`

Type definition for properties that can be plotted:
```typescript
export type PlottableProperty = {
  property: TReadOnlyProperty<number>;
  color: Color;
  label: string;
  visible?: Property<boolean>;
};
```

---

## Accessibility

The simulation includes comprehensive accessibility features for screen readers and keyboard-only users.

### PDOM (Parallel DOM)

Scenery's PDOM system creates an accessible DOM structure parallel to the visual scene graph:
- Buttons have proper ARIA labels
- Sliders are keyboard-navigable with arrow keys
- Focus order follows logical tab order
- Live regions announce dynamic changes

### Keyboard Shortcuts

Location: `src/common/view/KeyboardShortcutsNode.ts`

Defined shortcuts:
- **Space**: Play/pause
- **S**: Single step forward
- **R**: Reset all
- **V**: Toggle vector visibility
- **G**: Toggle grid
- **Arrow keys**: Adjust focused slider

### Voicing and Announcements

Location: `src/common/util/SimulationAnnouncer.ts`

The `SimulationAnnouncer` class provides text-to-speech announcements:
```typescript
announcer.announce('Simulation started');
announcer.announceValue('Mass', 2.5, 'kilograms');
```

Announcements are queued and spoken via the Utterance Queue system.

### Screen Summaries

Each screen view must implement `createScreenSummaryContent()`:
```typescript
createScreenSummaryContent(): Node {
  return new Node({
    tagName: 'p',
    innerContent: 'This screen simulates a mass on a spring...'
  });
}
```

This content is read when users first enter the screen.

---

## Internationalization

### StringManager

Location: `src/i18n/StringManager.ts`

Singleton class managing all translatable strings:
```typescript
const strings = StringManager.getInstance();
const title = strings.get('singleSpring.title');
const description = strings.get('singleSpring.description');
```

**String Categories**:
- Screen names and descriptions
- Physics parameter labels
- Preset names and descriptions
- UI button labels
- Accessibility descriptions
- Units and formatting

### Adding New Strings

1. Add to `StringManager.ts`:
```typescript
private static readonly STRINGS = {
  'newFeature.label': 'New Feature',
  'newFeature.description': 'Description of new feature'
};
```

2. Use in code:
```typescript
const label = StringManager.getInstance().get('newFeature.label');
```

3. For translation, strings should eventually be moved to separate locale files (future enhancement).

---

## Performance Considerations

### Optimization Strategies

1. **Derived Properties**: Use `DerivedProperty` instead of manual `lazyLink()`:
```typescript
// Good
this.energyProperty = new DerivedProperty(
  [this.velocityProperty, this.massProperty],
  (v, m) => 0.5 * m * v * v
);

// Avoid if possible
this.velocityProperty.link(() => {
  this.energyProperty.value = 0.5 * this.massProperty.value *
                                this.velocityProperty.value ** 2;
});
```

2. **Property Caching**: Properties cache their values, so multiple reads in one step are cheap.

3. **Avoid Unnecessary Calculations**: In `getDerivatives()`, cache repeated calculations:
```typescript
// Cache trigonometric values
const sinTheta = Math.sin(theta);
const cosTheta = Math.cos(theta);
// Use sinTheta and cosTheta multiple times
```

4. **Graph Data Retention**: Limit stored data points to prevent memory growth:
```typescript
const MAX_DATA_POINTS = 10000;
if (dataPoints.length > MAX_DATA_POINTS) {
  dataPoints.shift(); // Remove oldest
}
```

5. **Vector Auto-Hide**: Vectors auto-hide when magnitude is very small to avoid rendering micro-arrows.

### Browser Performance

- Simulation automatically pauses when tab is hidden (configurable)
- Frame rate adapts to device capability
- Canvas rendering optimized by Scenery

---

## Testing and Debugging

### Assertions

Development builds include assertions:
```typescript
assert && assert(mass > 0, 'Mass must be positive');
assert && assert(Array.isArray(state), 'State must be an array');
```

Run with `?ea` query parameter to enable assertions.

### Console Access

Objects are exposed via `ClassicalMechanicsNamespace` for debugging:
```typescript
// In browser console:
phet.classicalMechanics.singleSpringScreen.model.massProperty.value = 3.0;
phet.classicalMechanics.singleSpringScreen.model.reset();
```

### Unit Tests

Unit tests (if implemented) would typically cover:
- ODE solver accuracy (compare with analytical solutions)
- Energy conservation (for undamped systems)
- State mapping correctness
- Preset loading

### Common Issues

**Problem**: Simulation explodes (numbers become NaN or Infinity)
- **Cause**: Time step too large for stiff system or chaotic dynamics
- **Solution**: Reduce time step or use adaptive solver

**Problem**: Energy not conserved in undamped system
- **Cause**: Numerical integration error
- **Solution**: Use symplectic solver (Forest-Ruth) or smaller time step

**Problem**: Vectors not updating
- **Cause**: Properties not linked correctly
- **Solution**: Check that vector magnitude/angle properties are derived from state

**Problem**: Graph not displaying data
- **Cause**: Data cleared on reset or graph bounds incorrect
- **Solution**: Verify data collection in model, check auto-scaling settings

---

## Code Style and Conventions

### TypeScript Usage

- Use explicit types for public APIs
- Leverage `TReadOnlyProperty<T>` for properties that shouldn't be modified externally
- Use `const` for immutable bindings, avoid `var`

### Naming Conventions

- Properties: `camelCaseProperty` (e.g., `massProperty`, `velocityProperty`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_MASS`, `DEFAULT_SPRING_CONSTANT`)
- Private members: prefix with `_` or use TypeScript `private` keyword
- Files: `PascalCase.ts` for classes, `camelCase.ts` for utilities

### Comments

- Use JSDoc for public methods and classes
- Explain "why" not "what" in comments
- Document physics equations with references when possible

### Example:
```typescript
/**
 * Computes the angular acceleration for the double pendulum system.
 * Uses the equations derived from Lagrangian mechanics.
 * See: Levien & Tan (1993) "Double Pendulum: An Experiment in Chaos"
 *
 * @param state - Current state [theta1, omega1, theta2, omega2]
 * @returns Derivatives [omega1, alpha1, omega2, alpha2]
 */
getDerivatives(state: number[]): number[] {
  // Implementation...
}
```

---

## Future Enhancements

Potential areas for extension:

1. **Additional Solvers**: Implement more advanced methods (e.g., implicit solvers for stiff systems)
2. **3D Visualization**: Extend double pendulum to show conical motion
3. **Parameter Fitting**: Allow students to fit parameters to experimental data
4. **Phase Space Plots**: Display trajectories in phase space (position vs. velocity)
5. **Fourier Analysis**: Show frequency spectrum of oscillations
6. **More Presets**: Add more educational configurations
7. **Sound**: Sonify the motion (pitch based on position or velocity)
8. **Multi-Language**: Complete translations for all supported locales

---

## Additional Resources

- **SceneryStack Documentation**: https://github.com/phetsims/scenery/
- **PhET Development Overview**: https://github.com/phetsims/phet-info/
- **Classical Mechanics References**:
  - Taylor, John R. *Classical Mechanics*
  - Goldstein, Herbert. *Classical Mechanics*
  - Levien & Tan (1993). *Double Pendulum: An Experiment in Chaos*

---

## Maintenance Checklist

When making changes:

- [ ] Run linter: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Test all four screens
- [ ] Verify accessibility (keyboard navigation, screen reader)
- [ ] Check performance (no lag during simulation)
- [ ] Update presets if physics equations change
- [ ] Document any new physics simplifications in `model.md`
- [ ] Update this document if architecture changes
- [ ] Run with `?ea` to verify no assertion failures
- [ ] Test with different solvers and time steps

---

This implementation provides a solid foundation for educational physics simulations with good separation of concerns, extensibility, and maintainability.
