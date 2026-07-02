#!/bin/bash
# webapp-aesthetic-coder 安装脚本

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SKILL_NAME="webapp-aesthetic-coder"
MANAGED_SKILLS_DIR="$HOME/Library/Application Support/kimi-desktop/daimon-share/daimon/skills"

if [ -d "$MANAGED_SKILLS_DIR" ]; then
    TARGET_DIR="$MANAGED_SKILLS_DIR/$SKILL_NAME"
    echo "Installing to: $TARGET_DIR"
    mkdir -p "$TARGET_DIR"
    cp "$PROJECT_DIR/.skills/$SKILL_NAME/SKILL.md" "$TARGET_DIR/"
    cp -r "$PROJECT_DIR/.skills/$SKILL_NAME/references" "$TARGET_DIR/"
    echo "✅ Installed to Kimi Work"
else
    echo "Managed skills not found, keeping at project level"
    echo "✅ Available at: $PROJECT_DIR/.skills/$SKILL_NAME"
fi

echo ""
echo "Usage: Ask agent to use 'webapp-aesthetic-coder' skill"
