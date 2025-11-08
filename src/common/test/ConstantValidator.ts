/**
 * Utility for validating that constants meet their documented constraints.
 * This helps prevent regression when modifying constants.
 */

import { VELOCITY_VECTOR_SCALE, FORCE_VECTOR_SCALE, ACCELERATION_VECTOR_SCALE } from "../view/VectorScaleConstants.js";
import { MAX_TRAIL_POINTS } from "../view/graph/GraphDataConstants.js";
import { GRAPH_HEIGHT, GRAPH_LEFT_MARGIN, GRAPH_RIGHT_MARGIN, DIALOG_MEDIUM_MAX_WIDTH } from "../view/DialogAndPanelConstants.js";

/**
 * Validation result for a single constraint
 */
interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
  severity: "critical" | "warning" | "info";
}

/**
 * Validates that all constants meet their documented constraints.
 * Run this during development to catch constant-related issues early.
 */
export class ConstantValidator {
  private results: ValidationResult[] = [];

  /**
   * Run all validation checks
   */
  public validate(): ValidationResult[] {
    this.results = [];

    // Physics constant validations
    this.validateMaxDataPoints();
    this.validateVectorScales();
    this.validateGraphLayout();

    return this.results;
  }

  /**
   * Validate MAX_TRAIL_POINTS is reasonable for memory usage
   */
  private validateMaxDataPoints(): void {
    const MIN_SAFE = 100;
    const MAX_SAFE = 10000;

    if (MAX_TRAIL_POINTS < MIN_SAFE) {
      this.addResult({
        name: "MAX_TRAIL_POINTS too small",
        passed: false,
        message: `MAX_TRAIL_POINTS (${MAX_TRAIL_POINTS}) is below minimum safe value (${MIN_SAFE}). Users won't be able to see enough data history.`,
        severity: "critical",
      });
    } else if (MAX_TRAIL_POINTS > MAX_SAFE) {
      this.addResult({
        name: "MAX_TRAIL_POINTS too large",
        passed: false,
        message: `MAX_TRAIL_POINTS (${MAX_TRAIL_POINTS}) exceeds maximum safe value (${MAX_SAFE}). This may cause memory issues.`,
        severity: "critical",
      });
    } else {
      this.addResult({
        name: "MAX_TRAIL_POINTS",
        passed: true,
        message: `MAX_TRAIL_POINTS (${MAX_TRAIL_POINTS}) is within safe range [${MIN_SAFE}, ${MAX_SAFE}]`,
        severity: "info",
      });
    }
  }

  /**
   * Validate vector scales are reasonable
   */
  private validateVectorScales(): void {
    const scales = [
      { name: "VELOCITY_VECTOR_SCALE", value: VELOCITY_VECTOR_SCALE, unit: "px/(m/s)" },
      { name: "FORCE_VECTOR_SCALE", value: FORCE_VECTOR_SCALE, unit: "px/N" },
      { name: "ACCELERATION_VECTOR_SCALE", value: ACCELERATION_VECTOR_SCALE, unit: "px/(m/s²)" },
    ];

    const MIN_SCALE = 1;
    const MAX_SCALE = 200;

    for (const scale of scales) {
      if (scale.value < MIN_SCALE || scale.value > MAX_SCALE) {
        this.addResult({
          name: `${scale.name} out of range`,
          passed: false,
          message: `${scale.name} (${scale.value} ${scale.unit}) is outside safe range [${MIN_SCALE}, ${MAX_SCALE}]. Vectors may be invisible or too large.`,
          severity: "warning",
        });
      } else {
        this.addResult({
          name: scale.name,
          passed: true,
          message: `${scale.name} (${scale.value} ${scale.unit}) is within safe range`,
          severity: "info",
        });
      }
    }
  }

  /**
   * Validate graph layout constants don't conflict
   */
  private validateGraphLayout(): void {
    const totalMargin = GRAPH_LEFT_MARGIN + GRAPH_RIGHT_MARGIN;

    if (totalMargin > DIALOG_MEDIUM_MAX_WIDTH) {
      this.addResult({
        name: "Graph margins exceed dialog width",
        passed: false,
        message: `Graph margins (${totalMargin}px) exceed dialog width (${DIALOG_MEDIUM_MAX_WIDTH}px). Graph won't fit!`,
        severity: "critical",
      });
    } else {
      this.addResult({
        name: "Graph layout",
        passed: true,
        message: `Graph margins (${totalMargin}px) fit within dialog (${DIALOG_MEDIUM_MAX_WIDTH}px)`,
        severity: "info",
      });
    }

    // Check graph height is reasonable
    const MIN_HEIGHT = 100;
    const MAX_HEIGHT = 800;

    if (GRAPH_HEIGHT < MIN_HEIGHT || GRAPH_HEIGHT > MAX_HEIGHT) {
      this.addResult({
        name: "Graph height out of range",
        passed: false,
        message: `GRAPH_HEIGHT (${GRAPH_HEIGHT}px) is outside recommended range [${MIN_HEIGHT}, ${MAX_HEIGHT}]`,
        severity: "warning",
      });
    } else {
      this.addResult({
        name: "Graph height",
        passed: true,
        message: `GRAPH_HEIGHT (${GRAPH_HEIGHT}px) is within recommended range`,
        severity: "info",
      });
    }
  }

  /**
   * Add a validation result
   */
  private addResult(result: ValidationResult): void {
    this.results.push(result);
  }

  /**
   * Get a summary of validation results
   */
  public static getSummary(results: ValidationResult[]): string {
    const critical = results.filter(r => !r.passed && r.severity === "critical");
    const warnings = results.filter(r => !r.passed && r.severity === "warning");
    const passed = results.filter(r => r.passed);

    let summary = `Constant Validation Summary:\n`;
    summary += `  ✓ Passed: ${passed.length}\n`;
    summary += `  ⚠ Warnings: ${warnings.length}\n`;
    summary += `  ✗ Critical: ${critical.length}\n\n`;

    if (critical.length > 0) {
      summary += `Critical Issues:\n`;
      critical.forEach(r => summary += `  ✗ ${r.name}: ${r.message}\n`);
      summary += `\n`;
    }

    if (warnings.length > 0) {
      summary += `Warnings:\n`;
      warnings.forEach(r => summary += `  ⚠ ${r.name}: ${r.message}\n`);
    }

    return summary;
  }
}

/**
 * Run validation and log results to console.
 * Call this during development to check constants.
 */
export function validateConstants(): void {
  const validator = new ConstantValidator();
  const results = validator.validate();
  const summary = ConstantValidator.getSummary(results);

  console.log(summary);

  // Return non-zero if any critical issues found
  const hasCritical = results.some(r => !r.passed && r.severity === "critical");
  if (hasCritical) {
    console.error("❌ Critical constant validation failures detected!");
  } else {
    console.log("✅ All critical constant validations passed");
  }
}
