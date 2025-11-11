# Classical Mechanics Simulations - Model Description

This document describes the physics models used in the Classical Mechanics Simulations educational software. It is designed to help educators understand the underlying mathematical models and physics simplifications used in each simulation.

## Overview

The Classical Mechanics Simulations suite includes four distinct interactive simulations that demonstrate fundamental concepts in classical mechanics:

1. **Single Spring** - Damped harmonic oscillation
2. **Double Spring** - Coupled spring system
3. **Simple Pendulum** - Nonlinear rotational oscillation
4. **Double Pendulum** - Chaotic coupled pendulum system

All simulations use numerical integration methods to solve ordinary differential equations (ODEs) that govern the motion of the systems. Students can adjust physical parameters in real-time and observe how the system behavior changes.

---

## Single Spring Model

The Single Spring simulation models a mass attached to a vertical spring with damping. This is one of the most fundamental systems in classical mechanics.

### Physics Equations

The equation of motion for a damped spring-mass system is:

```
m·a = -k·x - b·v + m·g
```

Where:
- `m` = mass (kg)
- `a` = acceleration (m/s²)
- `k` = spring constant (N/m)
- `x` = displacement from equilibrium (m)
- `b` = damping coefficient (N·s/m)
- `v` = velocity (m/s)
- `g` = gravitational acceleration (9.8 m/s²)

The three forces acting on the mass are:
1. **Spring force**: `F_spring = -k·x` (Hooke's Law - opposes displacement)
2. **Damping force**: `F_damping = -b·v` (opposes motion)
3. **Gravitational force**: `F_gravity = m·g` (constant downward)

### State Variables

The simulation tracks two state variables that completely describe the system:
- Position `x` (measured from the natural length of the spring)
- Velocity `v = dx/dt`

The acceleration is derived from the forces: `a = (-k·x - b·v + m·g) / m`

### Energy Tracking

The simulation computes and displays three forms of energy:

1. **Kinetic Energy**: `KE = (1/2)·m·v²`
2. **Spring Potential Energy**: `PE_spring = (1/2)·k·x²`
3. **Gravitational Potential Energy**: `PE_grav = -m·g·x`
4. **Total Mechanical Energy**: `E_total = KE + PE_spring + PE_grav`

When damping is present (`b > 0`), total mechanical energy decreases over time as energy is dissipated as heat. When damping is zero, total energy is conserved (aside from small numerical errors).

### Parameter Ranges

Students can adjust:
- **Mass**: 0.5 kg to 5.0 kg
- **Spring constant**: 1 N/m to 100 N/m
- **Damping coefficient**: 0 N·s/m to 5 N·s/m (0 = no damping)

### Educational Highlights

- **Underdamped** (b small): System oscillates with decreasing amplitude
- **Critically damped** (b = 2√(km)): System returns to equilibrium as quickly as possible without oscillating
- **Overdamped** (b large): System slowly returns to equilibrium without oscillating
- **Undamped** (b = 0): System oscillates forever with constant amplitude (energy conserved)

---

## Double Spring Model

The Double Spring simulation models two masses connected in series by springs. This demonstrates coupled oscillators and normal modes.

### Physics Equations

The system consists of two masses with three springs: one connecting mass 1 to the ceiling, one connecting the two masses, and gravity acting on both.

```
m₁·a₁ = -k₁·x₁ + k₂·(x₂ - x₁) - b₁·v₁ + m₁·g
m₂·a₂ = -k₂·(x₂ - x₁) - b₂·v₂ + m₂·g
```

Where:
- `m₁, m₂` = masses (kg)
- `k₁` = spring constant for top spring (N/m)
- `k₂` = spring constant for connecting spring (N/m)
- `x₁, x₂` = positions of masses 1 and 2 from their natural spring lengths (m)
- `b₁, b₂` = damping coefficients (N·s/m)
- `v₁, v₂` = velocities (m/s)

The key physics concept is **coupling**: the motion of mass 1 affects mass 2 and vice versa through the middle spring.

### State Variables

The system requires four state variables:
- Position of mass 1: `x₁`
- Velocity of mass 1: `v₁`
- Position of mass 2: `x₂`
- Velocity of mass 2: `v₂`

### Normal Modes

Coupled oscillators exhibit **normal modes** - special patterns of oscillation where both masses oscillate at the same frequency:
1. **Symmetric mode**: Both masses move in phase (same direction at same time)
2. **Antisymmetric mode**: Masses move out of phase (opposite directions)

General motion is a superposition of these two modes.

### Energy Tracking

- **Kinetic energy**: `KE = (1/2)·m₁·v₁² + (1/2)·m₂·v₂²`
- **Spring potential energy**: `PE_spring = (1/2)·k₁·x₁² + (1/2)·k₂·(x₂-x₁)²`
- **Gravitational potential energy**: `PE_grav = -m₁·g·x₁ - m₂·g·x₂`
- **Total energy**: `E = KE + PE_spring + PE_grav`

### Educational Highlights

Students can observe:
- Energy transfer between the two masses
- Normal mode frequencies and patterns
- How coupling strength (k₂) affects the system behavior
- How different mass ratios change the oscillation patterns

---

## Simple Pendulum Model

The Simple Pendulum simulation models a point mass hanging from a massless, rigid rod that swings under gravity with optional damping.

### Physics Equations

Unlike the spring systems, the pendulum is described using **rotational dynamics**:

```
τ = I·α
-m·g·L·sin(θ) - b·ω = m·L²·α
```

Which simplifies to:

```
α = -(g/L)·sin(θ) - (b/m·L²)·ω
```

Where:
- `θ` = angle from vertical (radians)
- `ω = dθ/dt` = angular velocity (rad/s)
- `α = d²θ/dt²` = angular acceleration (rad/s²)
- `m` = mass of bob (kg)
- `L` = length of rod (m)
- `g` = gravitational acceleration (9.8 m/s²)
- `b` = rotational damping coefficient (N·m·s)
- `I = m·L²` = moment of inertia (kg·m²)
- `τ` = torque (N·m)

### Nonlinearity

**Important**: This simulation uses the **exact equation** with `sin(θ)`, not the small-angle approximation `sin(θ) ≈ θ`. This is crucial for large-amplitude oscillations.

For small angles (< 15°), the pendulum approximates simple harmonic motion with period:
```
T ≈ 2π·√(L/g)
```

For large angles, the period increases and the motion deviates from sinusoidal - students can observe this directly.

### State Variables

- Angle: `θ` (radians, measured from vertical)
- Angular velocity: `ω`

### Energy Tracking

- **Kinetic energy**: `KE = (1/2)·I·ω² = (1/2)·m·L²·ω²`
- **Gravitational potential energy**: `PE = m·g·L·(1 - cos(θ))`
  - PE is zero when hanging straight down (θ = 0)
  - PE is maximum when horizontal (θ = ±π/2)
- **Total energy**: `E = KE + PE`

### Parameter Ranges

- **Mass**: 0.5 kg to 5.0 kg
- **Length**: 0.5 m to 5.0 m
- **Damping**: 0 to 2 N·m·s
- **Initial angle**: Can be set to any value, including > 90° for dramatic swings

### Educational Highlights

- Nonlinear oscillation (period depends on amplitude)
- Energy conservation in undamped case
- Conversion between kinetic and potential energy
- Effect of length on period (longer pendulum = longer period)
- Mass does **not** affect period (common misconception)

---

## Double Pendulum Model

The Double Pendulum simulation demonstrates one of the simplest chaotic systems in classical mechanics. Two pendulums are connected: pendulum 1 hangs from a fixed pivot, and pendulum 2 hangs from the bob of pendulum 1.

### Physics Equations

The equations of motion are derived from Lagrangian mechanics and are significantly more complex:

```
(m₁ + m₂)·L₁²·α₁ + m₂·L₁·L₂·α₂·cos(θ₁-θ₂) + m₂·L₁·L₂·ω₂²·sin(θ₁-θ₂) = -(m₁+m₂)·g·L₁·sin(θ₁) - b₁·ω₁

m₂·L₂²·α₂ + m₂·L₁·L₂·α₁·cos(θ₁-θ₂) - m₂·L₁·L₂·ω₁²·sin(θ₁-θ₂) = -m₂·g·L₂·sin(θ₂) - b₂·ω₂
```

These coupled nonlinear differential equations must be solved simultaneously to find:
- `α₁` = angular acceleration of pendulum 1
- `α₂` = angular acceleration of pendulum 2

Where:
- `θ₁, θ₂` = angles of pendulums 1 and 2 from vertical
- `ω₁, ω₂` = angular velocities
- `m₁, m₂` = masses of bobs
- `L₁, L₂` = lengths of rods
- `b₁, b₂` = damping coefficients
- `g` = gravitational acceleration

### Chaotic Dynamics

The double pendulum is **chaotic**, meaning:
- Extremely sensitive to initial conditions
- Long-term behavior is unpredictable
- Small changes in starting position lead to drastically different trajectories
- No simple periodic solutions for most initial conditions

This is a hallmark of **deterministic chaos** - the system is completely deterministic (no randomness), yet unpredictable in practice.

### State Variables

Four state variables describe the system:
- `θ₁` - angle of first pendulum
- `ω₁` - angular velocity of first pendulum
- `θ₂` - angle of second pendulum
- `ω₂` - angular velocity of second pendulum

### Energy Tracking

The energy expressions include coupling terms:

**Kinetic Energy**:
```
KE = (1/2)·(m₁+m₂)·L₁²·ω₁² + (1/2)·m₂·L₂²·ω₂² + m₂·L₁·L₂·ω₁·ω₂·cos(θ₁-θ₂)
```

Note the coupling term that depends on both angular velocities.

**Potential Energy**:
```
PE = -(m₁+m₂)·g·L₁·cos(θ₁) - m₂·g·L₂·cos(θ₂)
```

**Total Energy**: `E = KE + PE`

### Trail Visualization

The simulation displays a trail showing the path traced by the second bob. In chaotic motion, this trail fills space in complex, non-repeating patterns. For special initial conditions (like symmetric modes), the trail may follow simple paths.

### Educational Highlights

- **Sensitive dependence on initial conditions** - key signature of chaos
- Unpredictability despite deterministic physics
- Complex motion from simple equations
- Energy transfer between the two pendulums
- Students can compare trajectories from nearly identical starting conditions

---

## Numerical Methods

All simulations use numerical integration to solve the differential equations. The simulation offers several methods:

1. **Runge-Kutta 4th Order (RK4)** - Default method, good balance of accuracy and speed
2. **Adaptive Runge-Kutta 4/5 (RK45)** - Adjusts step size automatically for efficiency
3. **Forest-Ruth PEFRL** - Symplectic integrator that better conserves energy
4. **Dormand-Prince 8(7)** - High-accuracy adaptive method

Students and teachers can change the integration method and time step size in the preferences. Smaller time steps increase accuracy but slow the simulation.

### Time Stepping

The simulation advances in discrete time steps. When running at normal speed, the simulation uses a default time step of 1 millisecond. Available options range from 0.01 ms (finest) to 5 ms (medium).

For the chaotic double pendulum, smaller time steps may be necessary to accurately capture the motion.

---

## Simplifications and Assumptions

To make these simulations tractable for students, several simplifications are made:

1. **One-dimensional or planar motion only**
   - Springs move only vertically
   - Pendulums swing only in a plane (no conical motion)

2. **Ideal components**
   - Springs are massless and obey Hooke's Law perfectly
   - Rods are rigid and massless
   - No air resistance (unless damping is explicitly enabled)

3. **Point masses**
   - All masses are treated as point particles
   - Realistic objects have distributed mass (moment of inertia effects)

4. **Constant gravity**
   - Assumes g = 9.8 m/s² everywhere
   - Neglects variations with altitude

5. **Linear damping**
   - Damping force proportional to velocity: F = -b·v
   - Real damping may be more complex (turbulent drag, etc.)

6. **No friction in pivots**
   - Pendulum pivots are frictionless unless damping is added

These simplifications allow students to focus on the fundamental physics principles without unnecessary complexity.

---

## Pedagogical Approach

The simulations are designed to:
- Allow hands-on exploration of classical mechanics concepts
- Visualize abstract concepts like energy and vectors
- Enable parameter variation to see cause-and-effect relationships
- Demonstrate both simple and complex behavior from the same physics
- Provide preset configurations that highlight important phenomena
- Support inquiry-based learning through experimentation

By manipulating parameters and observing results, students develop intuition for mechanical systems and deepen their understanding of physics principles.
