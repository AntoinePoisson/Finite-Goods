#!/bin/sh

limit="$1"
shift

if command -v timeout >/dev/null 2>&1; then
  exec timeout "$limit" "$@"
fi

if command -v gtimeout >/dev/null 2>&1; then
  exec gtimeout "$limit" "$@"
fi

# macos doesnt ship timeout, just run the command and hope it finishes
exec "$@"
