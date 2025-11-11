# Classical Mechanics Simulations

Interactive simulations of classical mechanics systems, built with [SceneryStack](https://github.com/sceneryStack). This collection allows users to explore fundamental concepts in mechanics through real-time, physics-based simulations.

## Simulations

This project includes four interactive simulations:

### 1. Single Spring
Explore the behavior of a mass-spring system with:
- Adjustable spring constant and mass
- Damping and gravity controls
- Real-time position and energy graphs
- Multiple preset scenarios

### 2. Double Spring
Study coupled oscillations with two springs:
- Independent control of both spring constants and masses
- Observation of normal modes
- Energy transfer visualization
- Phase space diagrams

### 3. Pendulum
Investigate pendulum motion including:
- Adjustable length and mass
- Small and large angle oscillations
- Energy conservation visualization
- Period measurement

### 4. Double Pendulum
Experience chaotic dynamics with:
- Highly sensitive dependence on initial conditions
- Rich phase space behavior
- Energy tracking for both pendulum bobs
- Path tracing to visualize chaotic motion

## Features

- Real-time physics simulation with multiple numerical solvers
- Interactive controls for all physical parameters
- Live graphs and visualizations
- Energy conservation tracking
- Phase space diagrams
- Pause/Resume functionality
- Keyboard shortcuts for efficient control
- Projector mode for presentations
- Accessibility features including voicing support
- Customizable preferences for solver methods and visualization
- Single HTML file build for easy distribution

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/veillette/classicalMechanicsSimulations.git
cd classicalMechanicsSimulations
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Build for production:

```bash
npm run build
```

### Development Scripts

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier
- `npm run fix`: Fix linting and formatting issues
- `npm run check`: Type-check TypeScript code
- `npm run serve`: Serve production build
- `npm run watch`: Watch TypeScript files
- `npm run clean`: Clean build directory

## Physics

The simulations use advanced numerical methods to accurately model classical mechanics:

### Numerical Solvers

- **RK4 (Runge-Kutta 4th Order)**: Classic fixed-step solver
- **Adaptive RK45**: Variable step size for improved accuracy
- **Forest-Ruth PEFRL**: Symplectic integrator for energy conservation
- **Dormand-Prince 8(7)**: High-order adaptive method

### Spring Visualization

- **Classic**: Traditional spring coil representation
- **Parametric**: Mathematical parametric surface visualization

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [SceneryStack](https://github.com/sceneryStack)
- Inspired by [PhET](https://phet.colorado.edu) Interactive Simulations
