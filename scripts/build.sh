#!/usr/bin/env bash
set -e

echo "=== Building GeoNexus Namma Space for Production ==="
npm run build
npm run lint
echo "=== Production Build and Type Check Succeeded ==="
