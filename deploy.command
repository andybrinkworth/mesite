#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Deploying to GitHub Pages..."

git add -A

# Check if there's anything to commit
if git diff --cached --quiet; then
  echo "✅ Nothing new to deploy — already up to date."
else
  git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M')"
  git -c credential.helper="" push https://andybrinkworth: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@github.com/andybrinkworth/mesite.git main
  echo "✅ Deployed! Live at https://andybrinkworth.github.io/mesite"
fi

echo ""
echo "Press any key to close..."
read -n 1
