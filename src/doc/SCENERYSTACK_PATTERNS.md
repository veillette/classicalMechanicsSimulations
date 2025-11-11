# SceneryStack Common Patterns

This document outlines the most common patterns used in SceneryStack (PhET simulation framework) based on the official documentation and our existing codebase.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Properties and Observables](#properties-and-observables)
3. [Scene Graph and Nodes](#scene-graph-and-nodes)
4. [Layout System](#layout-system)
5. [UI Components](#ui-components)
6. [Input Handling](#input-handling)
7. [Simulation Architecture](#simulation-architecture)
8. [Best Practices](#best-practices)

---

## Project Structure

### Standard Simulation Structure

```
src/
├── brand.ts              # Must be first import (loading order critical)
├── init.ts               # Initialization code
├── assert.ts             # Assertions
├── splash.ts             # Splash screen
├── main.ts               # Entry point
└── screen-name/
    ├── ScreenName.ts     # Screen definition
    ├── model/
    │   └── Model.ts      # Model layer (business logic)
    └── view/
        └── ScreenView.ts # View layer (visualization)
```

### Main Entry Point Pattern

```typescript
// main.ts
import "./brand.js";  // MUST be first import!

import { onReadyToLaunch, Sim } from "scenerystack/sim";
import { StringProperty } from "scenerystack/axon";
import { Tandem } from "scenerystack/tandem";
import { MyScreen } from "./my-screen/MyScreen.js";

onReadyToLaunch(() => {
  const titleStringProperty = new StringProperty("My Simulation");

  const screens = [
    new MyScreen({ tandem: Tandem.ROOT.createTandem("myScreen") }),
  ];

  const sim = new Sim(titleStringProperty, screens);
  sim.start();
});
```

**Key points**:
- `brand.js` must be imported first (loading order is critical)
- Use `onReadyToLaunch` callback for initialization
- Create screens with Tandem for instrumentation
- Call `sim.start()` to begin

---

## Properties and Observables

### Property Types

SceneryStack uses the **Axon** library for reactive programming:

```typescript
import {
  Property,
  NumberProperty,
  BooleanProperty,
  StringProperty,
  DerivedProperty
} from "scenerystack/axon";

// Basic Property
const myProperty = new Property<number>(0);

// Typed Properties (preferred)
const position = new NumberProperty(0);
const isVisible = new BooleanProperty(true);
const name = new StringProperty("Ball");

// Setting values
position.value = 5;
position.set(10);  // Alternative

// Getting values
const currentPosition = position.value;
```

### Observing Changes (Linking)

```typescript
// Simple link - called whenever value changes
position.link(value => {
  console.log(`Position changed to ${value}`);
});

// Link with lazy evaluation (not called immediately)
position.lazyLink((newValue, oldValue) => {
  console.log(`Changed from ${oldValue} to ${newValue}`);
});

// Dispose when done (important for memory management)
const listener = position.link(value => { /* ... */ });
position.unlink(listener);
```

### DerivedProperty Pattern

```typescript
// Computed property that auto-updates
const position = new NumberProperty(0);
const velocity = new NumberProperty(0);

// Energy = 0.5 * m * v^2
const kineticEnergy = new DerivedProperty(
  [velocity],
  (v) => 0.5 * mass * v * v
);

// Multiple dependencies
const totalEnergy = new DerivedProperty(
  [kineticEnergy, potentialEnergy],
  (ke, pe) => ke + pe
);

// Energy updates automatically when velocity or position changes!
```

### Multilink Pattern

```typescript
// Observe multiple properties at once
Multilink.multilink(
  [position, velocity, mass],
  (pos, vel, m) => {
    console.log(`State: pos=${pos}, vel=${vel}, mass=${m}`);
  }
);
```

### Property Options

```typescript
const myProperty = new NumberProperty(0, {
  // Range validation
  range: new Range(0, 100),

  // Units for display
  units: 'm/s',

  // For instrumentation/data collection
  tandem: Tandem.REQUIRED,
  phetioDocumentation: 'The velocity of the object',

  // Read-only externally
  phetioReadOnly: true
});
```

---

## Scene Graph and Nodes

### Node Hierarchy

SceneryStack uses a **scene graph** - a tree of visual nodes:

```typescript
import { Node, Circle, Rectangle, Text, Path } from "scenerystack/scenery";

// Create nodes
const parentNode = new Node();
const circle = new Circle(50, { fill: 'blue' });
const text = new Text("Hello", { font: "24px Arial" });

// Build hierarchy
parentNode.addChild(circle);
parentNode.addChild(text);

// Remove child
parentNode.removeChild(circle);

// Children array
parentNode.children = [circle, text];
```

### Common Node Types

```typescript
// Circle
const ball = new Circle(radius, {
  fill: 'red',
  stroke: 'black',
  lineWidth: 2,
  center: new Vector2(100, 100)
});

// Rectangle
const box = new Rectangle(x, y, width, height, {
  fill: 'blue',
  cornerRadius: 5
});

// Text
const label = new Text("Score: 0", {
  font: "18px Arial",
  fill: 'black'
});

// Line
const line = new Line(x1, y1, x2, y2, {
  stroke: 'black',
  lineWidth: 3
});

// Path (for custom shapes)
const shape = new Shape()
  .moveTo(0, 0)
  .lineTo(100, 0)
  .lineTo(50, 100)
  .close();
const customNode = new Path(shape, { fill: 'green' });

// Image
const sprite = new Image(imageURL, {
  scale: 0.5
});
```

### Node Transform Pattern

```typescript
// Position
node.translation = new Vector2(100, 200);
node.x = 100;  // shorthand
node.y = 200;
node.center = new Vector2(150, 150);
node.left = 50;
node.right = 250;
node.top = 100;
node.bottom = 200;

// Rotation (in radians)
node.rotation = Math.PI / 4;  // 45 degrees

// Scale
node.scale(2);  // 2x larger
node.setScaleMagnitude(0.5);  // half size

// Visibility
node.visible = true;
node.opacity = 0.5;  // semi-transparent
```

### Linking Properties to Nodes

```typescript
const position = new NumberProperty(0);
const circle = new Circle(20, { fill: 'red' });

// Update circle position when property changes
position.link(x => {
  circle.centerX = x;
});

// Or use binding helper
circle.centerXProperty.value = position.value;  // one-time
```

---

## Layout System

### FlowBox (Horizontal/Vertical Layout)

```typescript
import { HBox, VBox } from "scenerystack/scenery";

// Horizontal box
const hbox = new HBox({
  spacing: 10,           // Gap between children
  align: 'center',       // Vertical alignment
  children: [node1, node2, node3]
});

// Vertical box
const vbox = new VBox({
  spacing: 15,
  align: 'left',         // Horizontal alignment
  children: [header, content, footer]
});
```

### AlignBox (Alignment)

```typescript
import { AlignBox } from "scenerystack/scenery";

// Center a node within bounds
const centered = new AlignBox(myNode, {
  alignBounds: screenBounds,
  xAlign: 'center',
  yAlign: 'center'
});

// Align to corner
const topRight = new AlignBox(button, {
  alignBounds: screenBounds,
  xAlign: 'right',
  yAlign: 'top',
  xMargin: 10,
  yMargin: 10
});
```

### GridBox (Grid Layout)

```typescript
import { GridBox } from "scenerystack/scenery";

const grid = new GridBox({
  spacing: 10,
  rows: [
    [cell00, cell01, cell02],
    [cell10, cell11, cell12]
  ]
});

// Or add cells individually
grid.addCell(myNode, 0, 0);  // row 0, column 0
```

### Panel (Container with Background)

```typescript
import { Panel } from "scenerystack/sun";

const panel = new Panel(content, {
  fill: 'white',
  stroke: 'black',
  lineWidth: 1,
  cornerRadius: 5,
  xMargin: 10,
  yMargin: 10
});
```

---

## UI Components

### Buttons

```typescript
import {
  RectangularPushButton,
  TextPushButton,
  ResetAllButton
} from "scenerystack/scenery-phet";

// Text button
const button = new TextPushButton("Click Me", {
  listener: () => {
    console.log("Button clicked!");
  },
  baseColor: 'lightblue'
});

// Rectangular button with content
const iconButton = new RectangularPushButton({
  content: new Text("Go"),
  listener: () => { /* action */ },
  baseColor: 'green'
});

// Reset button (standard)
const resetButton = new ResetAllButton({
  listener: () => {
    model.reset();
  },
  right: layoutBounds.maxX - 10,
  bottom: layoutBounds.maxY - 10
});
```

### Checkboxes

```typescript
import { Checkbox } from "scenerystack/sun";

const showVelocity = new BooleanProperty(true);

const checkbox = new Checkbox(showVelocity, new Text("Show Velocity"), {
  boxWidth: 20
});

// Listen to changes
showVelocity.link(isChecked => {
  velocityArrow.visible = isChecked;
});
```

### Number Controls (Sliders)

```typescript
import { NumberControl } from "scenerystack/scenery-phet";
import { Range } from "scenerystack/dot";

const mass = new NumberProperty(1.0, {
  range: new Range(0.1, 10.0),
  units: 'kg'
});

const massControl = new NumberControl("Mass:", mass, mass.range, {
  delta: 0.1,                    // Arrow button increment
  layoutFunction: NumberControl.createLayoutFunction4({
    arrowButtonSpacing: 10
  }),
  titleNodeOptions: {
    font: "16px Arial"
  },
  numberDisplayOptions: {
    decimalPlaces: 2,
    valuePattern: "{0} kg"
  },
  sliderOptions: {
    majorTickLength: 15,
    trackSize: new Dimension2(150, 3)
  }
});

// Add tick marks
massControl.slider.addMajorTick(0.1, new Text("0.1"));
massControl.slider.addMajorTick(5.0, new Text("5.0"));
massControl.slider.addMajorTick(10.0, new Text("10.0"));
```

### HSlider (Simple Slider)

```typescript
import { HSlider } from "scenerystack/sun";

const slider = new HSlider(myProperty, new Range(0, 100), {
  trackSize: new Dimension2(200, 5),
  thumbSize: new Dimension2(15, 30),
  majorTickLength: 15
});

slider.addMajorTick(0);
slider.addMajorTick(50);
slider.addMajorTick(100);
```

### Radio Buttons

```typescript
import { RadioButtonGroup } from "scenerystack/sun";
import { Text } from "scenerystack/scenery";

const selectedOption = new Property<string>('option1');

const radioButtons = new RadioButtonGroup(selectedOption, [
  { value: 'option1', createNode: () => new Text("Option 1") },
  { value: 'option2', createNode: () => new Text("Option 2") },
  { value: 'option3', createNode: () => new Text("Option 3") }
], {
  spacing: 10,
  radioButtonOptions: {
    radius: 8
  }
});
```

---

## Input Handling

### DragListener Pattern

```typescript
import { DragListener } from "scenerystack/scenery";

const ball = new Circle(20, { fill: 'red' });

ball.addInputListener(new DragListener({
  // Transform from view to model coordinates
  positionProperty: ballPositionProperty,
  transform: modelViewTransform,

  // Optional callbacks
  start: (event) => {
    console.log("Drag started");
  },
  drag: (event) => {
    console.log("Dragging...", ballPositionProperty.value);
  },
  end: (event) => {
    console.log("Drag ended");
  }
}));

// Make cursor change on hover
ball.cursor = 'pointer';
```

### PressListener Pattern

```typescript
import { PressListener } from "scenerystack/scenery";

const button = new Rectangle(0, 0, 100, 50, { fill: 'blue' });

button.addInputListener(new PressListener({
  press: (event) => {
    console.log("Pressed!");
  },
  release: (event) => {
    console.log("Released!");
  }
}));
```

### Keyboard Drag Listener

```typescript
import { KeyboardDragListener } from "scenerystack/scenery";

const draggableNode = new Circle(30, { fill: 'green' });

draggableNode.addInputListener(new KeyboardDragListener({
  positionProperty: position,
  transform: modelViewTransform,
  dragSpeed: 100,  // pixels per second
  shiftDragSpeed: 20  // when shift is held
}));

// Make it focusable
draggableNode.focusable = true;
```

---

## Simulation Architecture

### Screen Pattern

```typescript
import { Screen } from "scenerystack/sim";
import { MyModel } from "./model/MyModel.js";
import { MyScreenView } from "./view/MyScreenView.js";

export class MyScreen extends Screen<MyModel, MyScreenView> {
  public constructor(options: ScreenOptions) {
    super(
      // Model factory
      () => new MyModel(),

      // View factory (receives model)
      (model) => new MyScreenView(model),

      options
    );
  }
}
```

### Model Pattern

```typescript
export class MyModel {
  public readonly positionProperty: NumberProperty;
  public readonly velocityProperty: NumberProperty;

  private mass: number = 1.0;
  private springConstant: number = 10.0;

  public constructor() {
    this.positionProperty = new NumberProperty(0);
    this.velocityProperty = new NumberProperty(0);
  }

  /**
   * Reset the model to initial state
   */
  public reset(): void {
    this.positionProperty.reset();
    this.velocityProperty.reset();
  }

  /**
   * Step the simulation forward
   * @param dt - time step in seconds
   */
  public step(dt: number): void {
    // Physics update
    const acceleration = -this.springConstant * this.positionProperty.value / this.mass;

    this.velocityProperty.value += acceleration * dt;
    this.positionProperty.value += this.velocityProperty.value * dt;
  }
}
```

### ScreenView Pattern

```typescript
import { ScreenView } from "scenerystack/sim";
import { MyModel } from "../model/MyModel.js";

export class MyScreenView extends ScreenView {
  private readonly model: MyModel;
  private readonly ball: Circle;

  public constructor(model: MyModel, options?: ScreenViewOptions) {
    super(options);
    this.model = model;

    // Create visual elements
    this.ball = new Circle(20, {
      fill: 'red',
      centerY: this.layoutBounds.centerY
    });
    this.addChild(this.ball);

    // Link model to view
    model.positionProperty.link(x => {
      this.ball.centerX = this.layoutBounds.centerX + x;
    });

    // Create controls
    const controlPanel = this.createControlPanel();
    this.addChild(controlPanel);

    // Reset button
    const resetButton = new ResetAllButton({
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    });
    this.addChild(resetButton);
  }

  private createControlPanel(): Node {
    const massControl = new NumberControl("Mass:", this.model.massProperty,
      new Range(0.1, 10), {
        // options...
      });

    return new Panel(new VBox({
      spacing: 10,
      children: [massControl, /* other controls */]
    }), {
      xMargin: 10,
      yMargin: 10,
      right: this.layoutBounds.maxX - 10,
      top: this.layoutBounds.minY + 10
    });
  }

  public reset(): void {
    // Reset view-specific state
  }

  public step(dt: number): void {
    // Update animations, etc.
  }
}
```

### ModelViewTransform Pattern

```typescript
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Bounds2 } from "scenerystack/dot";

// Define model bounds (in model units, e.g., meters)
const modelBounds = new Bounds2(-5, -5, 5, 5);

// Define view bounds (in screen pixels)
const viewBounds = this.layoutBounds;

// Create transform
const modelViewTransform = ModelViewTransform2.createRectangleMapping(
  modelBounds,
  viewBounds
);

// Use transform
const modelPosition = new Vector2(2, 3);  // in model units
const viewPosition = modelViewTransform.modelToViewPosition(modelPosition);

ball.center = viewPosition;

// Inverse transform (view to model)
const modelPos = modelViewTransform.viewToModelPosition(event.pointer.point);
```

---

## Best Practices

### 1. Separation of Concerns

```
✓ Model: Physics, business logic, state (Properties)
✓ View: Visualization, UI, user interaction
✗ Don't: Mix physics calculations in the view
✗ Don't: Directly manipulate view nodes from model
```

### 2. Memory Management

```typescript
// Always dispose listeners when done
class MyView extends ScreenView {
  private readonly positionListener: (x: number) => void;

  constructor(model: MyModel) {
    super();

    // Store listener reference
    this.positionListener = (x) => {
      this.ball.x = x;
    };

    model.positionProperty.link(this.positionListener);
  }

  dispose(): void {
    model.positionProperty.unlink(this.positionListener);
    super.dispose();
  }
}
```

### 3. Property Naming

```typescript
// Properties should end with "Property"
public readonly velocityProperty: NumberProperty;
public readonly isVisibleProperty: BooleanProperty;

// Access value with .value
const v = velocityProperty.value;
velocityProperty.value = 10;
```

### 4. Options Pattern

```typescript
// Use options objects for configuration
type MyNodeOptions = {
  color?: string;
  size?: number;
};

class MyNode extends Node {
  constructor(options?: MyNodeOptions) {
    const defaults: MyNodeOptions = {
      color: 'blue',
      size: 10
    };

    const resolvedOptions = { ...defaults, ...options };
    super();

    // Use resolvedOptions...
  }
}
```

### 5. Tandem Pattern (Instrumentation)

```typescript
// For data collection and PhET-iO
const myProperty = new NumberProperty(0, {
  tandem: parentTandem.createTandem('myProperty'),
  phetioDocumentation: 'The position of the ball in meters'
});
```

### 6. Reset Pattern

```typescript
// All properties should support reset
const position = new NumberProperty(0);  // 0 is initial value
position.value = 100;
position.reset();  // back to 0

// Models and views should implement reset()
public reset(): void {
  this.positionProperty.reset();
  this.velocityProperty.reset();
  // reset other state...
}
```

### 7. Step Pattern

```typescript
// Both model and view can have step methods
public step(dt: number): void {
  // dt is time since last frame in seconds (typically ~0.016 for 60 FPS)

  // Update physics
  this.velocity += this.acceleration * dt;
  this.position += this.velocity * dt;

  // Update animations
  this.rotationAngle += this.rotationSpeed * dt;
}
```

---

## Common Import Patterns

```typescript
// Simulation framework
import { Sim, Screen, ScreenView } from "scenerystack/sim";

// Properties
import { Property, NumberProperty, BooleanProperty, DerivedProperty } from "scenerystack/axon";

// Scene graph nodes
import { Node, Circle, Rectangle, Text, Line, Path, Image } from "scenerystack/scenery";

// Layout
import { HBox, VBox, AlignBox, GridBox } from "scenerystack/scenery";

// UI components
import { Panel, Checkbox, RadioButtonGroup } from "scenerystack/sun";
import {
  NumberControl,
  ResetAllButton,
  TextPushButton,
  RectangularPushButton
} from "scenerystack/scenery-phet";

// Input handling
import { DragListener, PressListener, KeyboardDragListener } from "scenerystack/scenery";

// Math utilities
import { Vector2, Range, Bounds2, Dimension2 } from "scenerystack/dot";

// Transforms
import { ModelViewTransform2 } from "scenerystack/phetcommon";

// Instrumentation
import { Tandem } from "scenerystack/tandem";
```

---

## Example: Complete Simple Simulation

```typescript
// Model
export class BallModel {
  public readonly positionProperty = new NumberProperty(0);
  public readonly velocityProperty = new NumberProperty(0);
  public massProperty = new NumberProperty(1.0);
  public springConstantProperty = new NumberProperty(10.0);

  public reset(): void {
    this.positionProperty.reset();
    this.velocityProperty.reset();
  }

  public step(dt: number): void {
    const a = -this.springConstantProperty.value * this.positionProperty.value / this.massProperty.value;
    this.velocityProperty.value += a * dt;
    this.positionProperty.value += this.velocityProperty.value * dt;
  }
}

// View
export class BallScreenView extends ScreenView {
  constructor(model: BallModel, options?: ScreenViewOptions) {
    super(options);

    const ball = new Circle(20, { fill: 'red' });
    this.addChild(ball);

    model.positionProperty.link(x => {
      ball.centerX = this.layoutBounds.centerX + x * 100;
    });

    const controls = new Panel(new VBox({
      spacing: 10,
      children: [
        new NumberControl("Mass:", model.massProperty, new Range(0.1, 10)),
        new NumberControl("Spring:", model.springConstantProperty, new Range(1, 50))
      ]
    }));
    this.addChild(controls);

    const resetButton = new ResetAllButton({
      listener: () => model.reset(),
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    });
    this.addChild(resetButton);
  }
}

// Screen
export class BallScreen extends Screen<BallModel, BallScreenView> {
  constructor(options: ScreenOptions) {
    super(
      () => new BallModel(),
      (model) => new BallScreenView(model),
      options
    );
  }
}
```

---

## Resources

- **Official Documentation**: https://scenerystack.org/
- **API Reference**: https://scenerystack.org/reference/
- **Examples**: https://scenerystack.org/learn/examples/
- **Community**: https://github.com/orgs/scenerystack/discussions
