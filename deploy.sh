#!/bin/bash

# ─────────────────────────────────────────
# Deploy script - uploads dist/ to server via FTP
# Usage: ./deploy.sh or `pnpm deploy`
# ─────────────────────────────────────────

set -e

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

# ─────────────────────────────────────────
# Detect OS and set lftp options accordingly
# ─────────────────────────────────────────
OS=$(uname)
echo "🖥️  Detected OS: $OS"

if [ "$OS" = "Darwin" ]; then
  echo "🍎 Using macOS lftp config..."
  LFTP_OPTS="
    set ftp:ssl-allow no
    set ftp:passive-mode yes
    set ftp:use-feat no
    set ftp:use-mdtm no
    set ftp:use-epsv no
    set net:timeout 30
    set net:max-retries 3
    set net:reconnect-interval-base 5
    set xfer:timeout 60
    set ftp:sync-mode on
  "
elif [ "$OS" = "Linux" ]; then
  echo "🐧 Using Linux lftp config..."
  LFTP_OPTS="
    set ftp:ssl-allow no
    set ftp:ssl-force no
    set ftp:ssl-protect-data no
    set ftp:ssl-protect-list no
    set ftp:passive-mode yes
    set ftp:use-feat no
    set ftp:use-mdtm no
    set ftp:use-epsv no
    set net:timeout 30
    set net:max-retries 3
    set net:reconnect-interval-base 5
    set xfer:timeout 60
    set net:socket-buffer 65536
    set ftp:use-stat no
  "
else
  echo "⚠️  Unknown OS: $OS — falling back to basic config"
  LFTP_OPTS="
    set ftp:ssl-allow no
    set ftp:passive-mode yes
    set net:timeout 30
    set net:max-retries 3
    set xfer:timeout 60
  "
fi

echo "🚀 Uploading to server..."
lftp -c "
  $LFTP_OPTS
  open ftp://$FTP_HOST
  user $FTP_USER $FTP_PASS
  mirror --reverse --verbose \
    --exclude .git/ \
    --exclude node_modules/ \
    ./dist/ $FTP_REMOTE_DIR
  wait
  mirror --reverse --delete --verbose \
    --exclude .git/ \
    --exclude node_modules/ \
    ./dist/ $FTP_REMOTE_DIR
  wait
"

echo ""
echo "✅ Deploy complete!"