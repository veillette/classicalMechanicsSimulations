#!/bin/bash

# Script to add namespace registration to TypeScript files
# Usage: ./scripts/add-namespace-registration.sh <file-path>
#
# This script:
# 1. Determines the correct import path for ClassicalMechanicsNamespace.js
# 2. Adds the import statement if not already present
# 3. Extracts the class name from the file
# 4. Adds the namespace registration if not already present

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <file-path>"
    echo "Example: $0 src/common/model/StatePropertyMapper.ts"
    exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
    echo "Error: File not found: $FILE"
    exit 1
fi

# Extract class name from the file
CLASS_NAME=$(grep -oP 'export (default )?(class|const) \K\w+' "$FILE" | head -1)

if [ -z "$CLASS_NAME" ]; then
    echo "Error: Could not extract class name from $FILE"
    exit 1
fi

echo "Processing: $FILE"
echo "Class name: $CLASS_NAME"

# Determine the correct import path based on file location
case "$FILE" in
    src/common/model/*)
        IMPORT_PATH="../../ClassicalMechanicsNamespace.js"
        ;;
    src/common/view/graph/*)
        IMPORT_PATH="../../../ClassicalMechanicsNamespace.js"
        ;;
    src/common/view/*)
        IMPORT_PATH="../../ClassicalMechanicsNamespace.js"
        ;;
    src/common/util/*)
        IMPORT_PATH="../../ClassicalMechanicsNamespace.js"
        ;;
    src/*/model/*)
        IMPORT_PATH="../../ClassicalMechanicsNamespace.js"
        ;;
    src/*/view/*)
        IMPORT_PATH="../../ClassicalMechanicsNamespace.js"
        ;;
    src/*/*.ts)
        IMPORT_PATH="../ClassicalMechanicsNamespace.js"
        ;;
    src/i18n/*)
        IMPORT_PATH="../ClassicalMechanicsNamespace.js"
        ;;
    *)
        echo "Error: Could not determine import path for $FILE"
        exit 1
        ;;
esac

echo "Import path: $IMPORT_PATH"

# Check if import already exists
if grep -q "import classicalMechanics from.*ClassicalMechanicsNamespace" "$FILE"; then
    echo "✓ Import already exists"
else
    echo "Adding import statement..."

    # Find the last import line
    LAST_IMPORT_LINE=$(grep -n "^import " "$FILE" | tail -1 | cut -d: -f1)

    if [ -n "$LAST_IMPORT_LINE" ]; then
        # Add import after the last import
        sed -i "${LAST_IMPORT_LINE}a import classicalMechanics from '${IMPORT_PATH}';" "$FILE"
        echo "✓ Import added after line $LAST_IMPORT_LINE"
    else
        echo "Error: Could not find import statements in $FILE"
        exit 1
    fi
fi

# Check if registration already exists
if grep -q "classicalMechanics.register.*${CLASS_NAME}" "$FILE"; then
    echo "✓ Registration already exists"
else
    echo "Adding namespace registration..."

    # Add registration at the end of the file
    echo "" >> "$FILE"
    echo "// Register with namespace for debugging accessibility" >> "$FILE"
    echo "classicalMechanics.register('${CLASS_NAME}', ${CLASS_NAME});" >> "$FILE"

    echo "✓ Registration added"
fi

echo "✅ Done processing $FILE"
echo ""
