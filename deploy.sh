#!/bin/bash

# ─────────────────────────────────────────
# Deploy script - uploads dist/ to server via FTP
# Usage: ./deploy.sh or `pnpm deploy`
# ─────────────────────────────────────────

set -e  # stop on any error

# Load env
source .env.deploy

echo "🔍 Checking branch..."
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "❌ You must be on main branch to deploy (current: $BRANCH)"
  exit 1
fi

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🏗️  Building..."
pnpm build

if [ ! -d "./dist" ]; then
  echo "❌ dist/ folder not found, build may have failed"
  exit 1
fi

echo "🚀 Uploading to server..."
lftp -c "
  open -u $FTP_USER,$FTP_PASS ftp://$FTP_HOST
  set ftp:passive-mode yes
  set net:timeout 30
  set net:max-retries 3
  set ssl:verify-certificate no
  mirror --reverse --delete --verbose \
    --exclude .git/ \
    --exclude node_modules/ \
    ./dist/ $FTP_REMOTE_DIR
"

echo ""
echo "✅ Deploy complete!"