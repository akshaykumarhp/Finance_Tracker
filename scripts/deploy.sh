#!/usr/bin/env bash
# Deploys to Vercel production and re-points the friendly aliases
# (roost-hq.vercel.app / roosthq.vercel.app) at the new deployment.
#
# Why this exists: a manually-set `vercel alias` points at one specific
# deployment URL, not "whatever is in production" — so after every new
# deploy it goes stale unless re-pointed. This script does that step
# automatically so the friendly URLs never serve an old build.
set -euo pipefail

OUTPUT=$(vercel deploy --prod --yes)
echo "$OUTPUT"

DEPLOY_URL=$(echo "$OUTPUT" | grep -oE 'https://[a-zA-Z0-9.-]+\.vercel\.app' | tail -1)

if [ -z "$DEPLOY_URL" ]; then
  echo "Could not determine deployment URL; skipping alias update." >&2
  exit 1
fi

vercel alias set "$DEPLOY_URL" roost-hq.vercel.app
vercel alias set "$DEPLOY_URL" roosthq.vercel.app
