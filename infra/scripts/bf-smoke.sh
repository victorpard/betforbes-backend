#!/usr/bin/env bash
set -Eeuo pipefail

CODE="${CODE:-5NI291}"
FRONT_URL="${FRONT_URL:-https://www.betforbes.com}"
LOG="${LOG:-/var/log/bf_smoke.log}"

ts() { date +"%Y-%m-%d %H:%M:%S%z"; }

HDRS="$(curl -sS -k -D - -o /dev/null "$FRONT_URL/r/$CODE")"
CLEAN="$(printf '%s\n' "$HDRS" | tr -d '\r')"

dom='BAD'; sec='BAD'; ssi='BAD'
printf '%s\n' "$CLEAN" | grep -qi '^[Ss]et-[Cc]ookie: .*bf_ref=.*\bDomain=\.betforbes\.com\b' && dom='OK'
printf '%s\n' "$CLEAN" | grep -qi '^[Ss]et-[Cc]ookie: .*bf_ref=.*\bSecure\b'                 && sec='OK'
printf '%s\n' "$CLEAN" | grep -qi '^[Ss]et-[Cc]ookie: .*bf_ref=.*\bSameSite=Lax\b'           && ssi='OK'

{
  echo "$(ts) /r/$CODE -> $(printf '%s\n' "$CLEAN" | sed -n '1p')"
  printf '%s\n' "$CLEAN" | sed -n '/^[sS]et-[cC]ookie:/p;/^[lL]ocation:/p'
  echo "$(ts) ASSERTS: Domain $dom | Secure $sec | SameSite $ssi"
  echo "----"
} >> "$LOG"
