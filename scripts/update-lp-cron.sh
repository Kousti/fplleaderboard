#!/bin/bash
# Trigger LP snapshot on the deployed Vercel app.
# Usage on Ubuntu: set CRON_SECRET, then add to crontab:
#   */15 * * * * CRON_SECRET='...' /path/to/finnhouseleaderboard/scripts/update-lp-cron.sh

set -euo pipefail

APP_URL="${APP_URL:-https://fhleaderboard.vercel.app}"

if [[ -z "${CRON_SECRET:-}" ]]; then
  echo "CRON_SECRET is not set" >&2
  exit 1
fi

curl -fsS -X POST "${APP_URL}/api/cron/update-lp" \
  -H "Authorization: Bearer ${CRON_SECRET}"

echo
