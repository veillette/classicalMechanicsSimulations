# Project Structure

This document provides an overview of the Classical Mechanics Simulations project structure.

## Root Directory

```
classicalMechanicsSimulations/
├── src/                          # Source code
├── doc/                          # Documentation
├── dist/                         # Build output (generated)
├── node_modules/                 # Dependencies (generated)
├── .github/                      # GitHub configuration
├── .claude/                      # Claude Code configuration
├── .idea/                        # IDE configuration
├── scripts/                      # Build and utility scripts
├── package.json                  # Node.js project configuration
├── tsconfig.json                 # TypeScript configuration
├── vite.config.js                # Vite build configuration
├── eslint.config.js              # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── index.html                    # Main HTML entry point
├── README.md                     # Project overview
├── CONTRIBUTING.md               # Contribution guidelines
├── LICENSE                       # MIT License
└── Claude.md                     # Claude Code instructions
```

## Source Directory Structure

### Root Level (`src/`)

```
src/
├── main.ts                       # Application entry point
├── init.ts                       # Initialization logic
├── brand.ts                      # Branding configuration
├── splash.ts                     # Splash screen
├── assert.ts                     # Assertion utilities
├── ClassicalMechanicsNamespace.ts
├── ClassicalMechanicsColors.ts   # Color scheme definitions
├── ClassicalMechanicsPreferences.ts # User preferences management
├── assets/                       # Images and static assets
├── i18n/                         # Internationalization
├── common/                       # Shared code across simulations
├── single-spring/                # Single spring simulation
├── double-spring/                # Double spring simulation
├── pendulum/                     # Pendulum simulation
└── double-pendulum/              # Double pendulum simulation
```

### Internationalization (`src/i18n/`)

```
i18n/
├── StringManager.ts              # String management system
├── strings_en.json               # English translations
└── strings_fr.json               # French translations
```

### Common Code (`src/common/`)

Shared code used across all simulations, organized into three main categories:

#### Model Layer (`src/common/model/`)

```
model/
├── BaseModel.ts                  # Abstract base model for all simulations
├── Preset.ts                     # Preset scenario definitions
├── StatePropertyMapper.ts        # Maps between simulation state and properties
├── SimulationParameterRanges.ts  # Valid parameter ranges
├── SolverType.ts                 # Enumeration of solver types
├── NominalTimeStep.ts            # Time step size options
├── ODESolver.ts                  # Base ODE solver interface
├── RungeKuttaSolver.ts           # RK4 solver implementation
├── AdaptiveRK45Solver.ts         # Adaptive RK45 solver
├── ForestRuthPEFRLSolver.ts      # Symplectic PEFRL solver
└── DormandPrince87Solver.ts      # High-order Dormand-Prince solver
```

#### View Layer (`src/common/view/`)

```
view/
├── BaseScreenView.ts             # Abstract base view for screens
├── ParameterControlPanel.ts      # Parameter adjustment controls
├── ToolsControlPanel.ts          # Tools panel UI
├── VectorControlPanel.ts         # Vector display controls
├── PresetSelectorFactory.ts      # Preset scenario selector
├── SpringNode.ts                 # Classic spring visualization
├── ParametricSpringNode.ts       # Parametric spring visualization
├── SpringVisualizationType.ts    # Spring rendering mode enum
├── SpringVisualizationConstants.ts
├── VectorNode.ts                 # Vector arrow visualization
├── VectorNodeFactory.ts          # Factory for creating vector nodes
├── VectorScaleConstants.ts       # Vector scaling constants
├── PendulumLabProtractorNode.ts  # Angle measurement tool
├── SceneGridNode.ts              # Background grid
├── KeyboardShortcutsNode.ts      # Keyboard help display
├── ClassicalMechanicsAudioPreferencesNode.ts # Audio settings UI
├── ControlLayoutConstants.ts     # Layout constants for controls
├── DialogAndPanelConstants.ts    # Dialog styling constants
├── FontSizeConstants.ts          # Font size definitions
├── UILayoutConstants.ts          # General UI layout constants
├── ScreenIconConstants.ts        # Screen icon dimensions
└── graph/                        # Graphing components
    └── [Graph components]
```

#### Utilities (`src/common/util/`)

```
util/
├── SimulationAnnouncer.ts        # Accessibility announcements
├── ParameterChangeAnnouncer.ts   # Parameter change notifications
└── AccessibilityDelayConstants.ts # Timing for accessibility features
```

### Simulation-Specific Directories

Each simulation follows the same organizational pattern:

```
[simulation-name]/
├── [SimulationName]Screen.ts         # Screen configuration
├── [SimulationName]ScreenIcon.ts     # Screen icon
├── model/
│   ├── [SimulationName]Model.ts      # Physics model
│   └── [SimulationName]Presets.ts    # Preset scenarios
└── view/
    └── [SimulationName]ScreenView.ts # View implementation
```

#### Single Spring (`src/single-spring/`)

Single mass-spring system with damping and gravity.

```
single-spring/
├── SingleSpringScreen.ts
├── SingleSpringScreenIcon.ts
├── model/
│   ├── SingleSpringModel.ts
│   └── SingleSpringPresets.ts
└── view/
    └── SingleSpringScreenView.ts
```

#### Double Spring (`src/double-spring/`)

Two masses connected by springs (coupled oscillators).

```
double-spring/
├── DoubleSpringScreen.ts
├── DoubleSpringScreenIcon.ts
├── model/
│   ├── DoubleSpringModel.ts
│   └── DoubleSpringPresets.ts
└── view/
    └── DoubleSpringScreenView.ts
```

#### Pendulum (`src/pendulum/`)

Single pendulum with adjustable parameters.

```
pendulum/
├── PendulumScreen.ts
├── PendulumScreenIcon.ts
├── model/
│   ├── PendulumModel.ts
│   └── PendulumPresets.ts
└── view/
    └── PendulumScreenView.ts
```

#### Double Pendulum (`src/double-pendulum/`)

Chaotic double pendulum system.

```
double-pendulum/
├── DoublePendulumScreen.ts
├── DoublePendulumScreenIcon.ts
├── model/
│   ├── DoublePendulumModel.ts
│   └── DoublePendulumPresets.ts
└── view/
    └── DoublePendulumScreenView.ts
```

## Documentation (`doc/`)

```
doc/
├── implementation-notes.md       # Implementation details and decisions
└── model.md                      # Physics model documentation
```

## Architecture Overview

### Model-View Pattern

The project follows a strict Model-View separation:

- **Model Layer**: Contains physics simulation logic, numerical solvers, and state management
- **View Layer**: Handles rendering, user interaction, and visual representation

### Code Reuse Strategy

- **BaseModel**: Abstract class providing common simulation features
- **BaseScreenView**: Abstract class for view implementation
- **Common utilities**: Shared across all simulations (solvers, vector display, graphs)
- **Preset system**: Standardized way to define initial conditions

### Key Technologies

- **SceneryStack**: UI framework for interactive simulations
- **TypeScript**: Type-safe JavaScript implementation
- **Vite**: Fast build tool and development server
- **KaTeX**: Mathematical formula rendering

### Numerical Solvers

Multiple ODE solvers are implemented for different accuracy/performance tradeoffs:

1. **RK4**: Classic 4th-order Runge-Kutta
2. **Adaptive RK45**: Variable step size Runge-Kutta-Fehlberg
3. **PEFRL**: Forest-Ruth symplectic integrator (energy-conserving)
4. **Dormand-Prince 8(7)**: High-order adaptive method

## Adding a New Simulation

To add a new simulation:

1. Create a new directory under `src/` (e.g., `src/my-simulation/`)
2. Follow the structure: `model/`, `view/`, Screen, and ScreenIcon files
3. Extend `BaseModel` for the physics model
4. Extend `BaseScreenView` for the view
5. Create preset scenarios in `*Presets.ts`
6. Add screen to `src/main.ts` screens array
7. Add translations to `src/i18n/strings_*.json`

## Build Output

```
dist/
└── index.html                    # Single-file production build
```

The build process creates a single self-contained HTML file with all resources embedded.

---

## Architecture Patterns Used

✓ **MVC Architecture** - Model, View, Screen separation
✓ **Observable Pattern** - Properties for reactive updates
✓ **Strategy Pattern** - Pluggable RK4 solver
✓ **Composition** - Reusable SpringNode component
✓ **Factory Pattern** - Screen factories for models/views

---

## Dependencies

- **scenerystack/sim** - Simulation framework
- **scenerystack/scenery** - Scene graph and nodes
- **scenerystack/axon** - Properties and observables
- **scenerystack/sun** - UI components (Panel)
- **scenerystack/scenery-phet** - PhET-specific UI (NumberControl, ResetAllButton)
- **scenerystack/dot** - Math utilities (Vector2, Range)
- **scenerystack/kite** - Shapes and paths
- **scenerystack/tandem** - Instrumentation

---

## File Statistics

- **Total TypeScript Files**: 54
- **Total Lines of Code**: ~6,900+ lines
- **Models**: 4 (one per screen) + BaseModel
- **Views**: 4 (one per screen) + BaseScreenView
- **Screen Icons**: 4 (one per screen)
- **ODE Solvers**: 4 different numerical integration methods
- **Graph Components**: 4 (ConfigurableGraph, GraphDataSet, PlottableProperty, index.ts)
- **Spring Visualization Types**: 2 (Classic SpringNode, Parametric ParametricSpringNode)
- **Tools & Utilities**: Vector display, Grid, Protractor, Keyboard shortcuts
- **Accessibility**: SimulationAnnouncer, Audio preferences, Keyboard help
- **Common Components**: 25 (solvers, graphs, tools, base classes, utilities)
- **Preset Configurations**: 4 (one per screen)
- **Screens**: 4 (all integrated in main.ts)

---

## Features Summary

| Feature | Single Spring | Double Spring | Pendulum | Double Pendulum |
|---------|--------------|---------------|----------|-----------------|
| Draggable Objects | ✓ (1 mass) | ✓ (2 masses) | ✓ (bob) | ✓ (2 bobs) |
| Spring Visualization | ✓ | ✓✓ (2 springs) | - | - |
| Nonlinear Physics | ✓ (damping) | ✓ (coupling) | ✓ (large angles) | ✓✓ (chaos) |
| Energy Display | ✓ | ✓ | ✓ | ✓ |
| Trail Visualization | - | - | - | ✓ |
| Chaotic Behavior | - | - | - | ✓✓ |
| Parameter Controls | 3 | 6 | 4 | 5 |
| **ConfigurableGraph** | ✓ | ✓ | ✓ | ✓ |
| **Graph Pan/Zoom/Resize** | ✓ | ✓ | ✓ | ✓ |
| **Preset Configurations** | ✓ | ✓ | ✓ | ✓ |
| **Multiple Solvers** | ✓ | ✓ | ✓ | ✓ |
| **Spring Visualization Types** | ✓ | ✓ | - | - |
| **Vector Display** | ✓ | ✓ | ✓ | ✓ |
| **Grid Overlay** | ✓ | ✓ | ✓ | ✓ |
| **Protractor Tool** | - | - | ✓ | ✓ |
| **Screen Icons** | ✓ | ✓ | ✓ | ✓ |
| **Keyboard Shortcuts** | ✓ | ✓ | ✓ | ✓ |
| **Accessibility** | ✓ | ✓ | ✓ | ✓ |

---
