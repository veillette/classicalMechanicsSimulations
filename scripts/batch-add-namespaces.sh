#!/bin/bash

# Batch script to add namespace registration to multiple files
# This processes all remaining files that need namespace registration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "======================================================================"
echo "Batch Adding Namespace Registration to Remaining Files"
echo "======================================================================"
echo ""

# Counter for tracking progress
TOTAL=0
SUCCESS=0
SKIPPED=0
FAILED=0

# Function to process a file
process_file() {
    local file="$1"
    TOTAL=$((TOTAL + 1))

    echo "[$TOTAL] Processing: $file"

    if ./scripts/add-namespace-registration.sh "$file"; then
        SUCCESS=$((SUCCESS + 1))
    else
        FAILED=$((FAILED + 1))
        echo "❌ Failed to process: $file"
    fi

    echo "-------------------------------------------------------------------"
}

echo "PRIORITY 1: Model Classes"
echo "======================================================================="
echo ""

# Remaining Physics Models
process_file "src/double-pendulum/model/DoublePendulumModel.ts"
process_file "src/double-spring/model/DoubleSpringModel.ts"

# Remaining ODE Solvers
process_file "src/common/model/AdaptiveRK45Solver.ts"
process_file "src/common/model/ForestRuthPEFRLSolver.ts"
process_file "src/common/model/DormandPrince87Solver.ts"

# Supporting Model Classes
process_file "src/common/model/StatePropertyMapper.ts"
process_file "src/common/model/NominalTimeStep.ts"
process_file "src/common/model/Preset.ts"

echo ""
echo "PRIORITY 2: View Classes"
echo "======================================================================="
echo ""

# Screen Views
process_file "src/single-spring/view/SingleSpringScreenView.ts"
process_file "src/double-spring/view/DoubleSpringScreenView.ts"
process_file "src/pendulum/view/PendulumScreenView.ts"
process_file "src/double-pendulum/view/DoublePendulumScreenView.ts"

# View Components
process_file "src/common/view/ParameterControlPanel.ts"
process_file "src/common/view/VectorControlPanel.ts"
process_file "src/common/view/ToolsControlPanel.ts"
process_file "src/common/view/SpringNode.ts"
process_file "src/common/view/ParametricSpringNode.ts"
process_file "src/common/view/SceneGridNode.ts"
process_file "src/common/view/VectorNodeFactory.ts"
process_file "src/common/view/KeyboardShortcutsNode.ts"
process_file "src/common/view/PendulumLabProtractorNode.ts"
process_file "src/common/view/PresetSelectorFactory.ts"
process_file "src/common/view/ClassicalMechanicsAudioPreferencesNode.ts"

# Graph System
process_file "src/common/view/graph/ConfigurableGraph.ts"
process_file "src/common/view/graph/GraphDataManager.ts"
process_file "src/common/view/graph/GraphControlsPanel.ts"
process_file "src/common/view/graph/GraphInteractionHandler.ts"

echo ""
echo "PRIORITY 3: Utility & Other Classes"
echo "======================================================================="
echo ""

# Singleton
process_file "src/i18n/StringManager.ts"

# Screen Classes
process_file "src/single-spring/SingleSpringScreen.ts"
process_file "src/double-spring/DoubleSpringScreen.ts"
process_file "src/pendulum/PendulumScreen.ts"
process_file "src/double-pendulum/DoublePendulumScreen.ts"

# Screen Icons
process_file "src/single-spring/SingleSpringScreenIcon.ts"
process_file "src/double-spring/DoubleSpringScreenIcon.ts"
process_file "src/pendulum/PendulumScreenIcon.ts"
process_file "src/double-pendulum/DoublePendulumScreenIcon.ts"

# Preset Classes
process_file "src/single-spring/model/SingleSpringPresets.ts"
process_file "src/double-spring/model/DoubleSpringPresets.ts"
process_file "src/pendulum/model/PendulumPresets.ts"
process_file "src/double-pendulum/model/DoublePendulumPresets.ts"

# Utilities (if they export classes)
if grep -q "export.*class" "src/common/util/SimulationAnnouncer.ts" 2>/dev/null; then
    process_file "src/common/util/SimulationAnnouncer.ts"
fi

if grep -q "export.*class" "src/common/util/ParameterChangeAnnouncer.ts" 2>/dev/null; then
    process_file "src/common/util/ParameterChangeAnnouncer.ts"
fi

echo ""
echo "======================================================================"
echo "SUMMARY"
echo "======================================================================"
echo "Total files processed: $TOTAL"
echo "Successfully updated:  $SUCCESS"
echo "Skipped:              $SKIPPED"
echo "Failed:               $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ All files processed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Review the changes: git diff"
    echo "2. Test the build: npm run build"
    echo "3. Test linting: npm run lint"
    echo "4. Commit the changes: git add -A && git commit -m 'Add namespace registration to remaining files'"
else
    echo "⚠️  Some files failed to process. Please review manually."
    exit 1
fi
